import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt


def get_year(person_id, year_dict):
    birthyear = year_dict[person_id]["dob"]
    deathyear = year_dict[person_id]["dod"]
    nianhao = year_dict[person_id]["nianhao"]
    return birthyear, deathyear, nianhao


def process_graph(df, nianhao_df, agg_num):
    agg_id = 600000
    year_dict = get_all_birth_death_year(df, nianhao_df)
    writer = df[["person_id", "writer"]].drop_duplicates()
    node_id_set = set()
    nodes = []
    links = []
    for idx in writer.index:
        person_id, person_name = writer.loc[idx, ["person_id", "writer"]]
        print(person_name)
        person_id = int(person_id)
        person_birthyear, person_deathyear, person_nianhao = get_year(person_id, year_dict)
        person_count = df.query(f"person_id=={person_id} or assoc_id=={person_id}").shape[0]
        # 加入当前作者
        if person_id not in node_id_set:
            node_id_set.add(person_id)
            nodes.append({
                "id": person_id,
                "name": person_name,
                "agg": False,
                "birth_year": person_birthyear,
                "death_year": person_deathyear,
                "radius": person_count,
                "nianhao": person_nianhao
            })

        # 加入收信人
        assoc = df.query(f"person_id=={person_id}").dropna(subset=["assoc_id"])\
            .groupby(by=["assoc_id", "assoc_name"], as_index=False)["line"].count()
        agg = None  # 聚合多个通信对象
        for idx2 in assoc.index:
            assoc_id, assoc_name, receive_count = assoc.loc[idx2, ["assoc_id", "assoc_name", "line"]]
            assoc_id = int(assoc_id)
            receive_count = int(receive_count)
            assoc_birthyear, assoc_deathyear, assoc_nianhao = get_year(person_id, year_dict)
            # 判断是重要结点还是聚合 与其他人有书信来往，或通信量>agg_num
            all_count = df.query(f"assoc_id=={assoc_id} or person_id=={assoc_id}").shape[0]
            if all_count > agg_num:  # df.query(f"assoc_id=={assoc_id} and person_id!={person_id}").shape[0] > 0:
                # 是重要结点
                # 判断是否加入结点
                if assoc_id not in node_id_set:
                    node_id_set.add(assoc_id)
                    nodes.append({
                        "id": assoc_id,
                        "name": assoc_name,
                        "agg": False,
                        "birth_year": assoc_birthyear,
                        "death_year": assoc_deathyear,
                        "radius": all_count,
                        "nianhao": assoc_nianhao
                    })
                # 加入边
                links.append({
                    "source": person_id,
                    "target": assoc_id,
                    "value": receive_count
                })
            else:
                if agg is None:
                    agg = {
                        "id": assoc_id,
                        "name": [assoc_name],
                        "agg": False,
                        "birth_year": assoc_birthyear,
                        "death_year": assoc_deathyear,
                        "radius": all_count,
                        "nianhao": assoc_nianhao
                    }
                else:
                    agg["name"].append(assoc_name)
                    agg["agg"] = True
                    agg["birth_year"] = person_birthyear
                    agg["death_year"] = person_deathyear
                    agg["radius"] = max(agg["radius"], all_count)  # 聚合的所有人中，总信件数量最多的一个
                    agg["nianhao"] = person_nianhao

        # 存在聚合结点
        if agg is not None:
            if agg["agg"]:
                agg["id"] = agg_id
                agg_id += 1
            agg["name"] = ",".join(agg["name"])
            nodes.append(agg)
            node_id_set.add(agg["id"])
            links.append({
                "source": person_id,
                "target": agg["id"],
                "value": agg["radius"]
            })
    return nodes, links


def save_graph(nodes, links, path):
    data = {}
    data["nodes"] = nodes
    data["links"] = links
    with open(path, "w") as f:
        f.write(json.dumps(data))


def get_all_birth_death_year(df, nianhao_df):
    # 年号
    # 去重
    nianhao_df.drop_duplicates(subset="c_firstyear", keep='last', inplace=True)
    # 去掉北元
    nianhao_df = nianhao_df.query("c_dynasty_chn!='北元'")
    bins = nianhao_df["c_firstyear"].values.tolist() + [nianhao_df["c_lastyear"].iloc[-1]]
    labels = nianhao_df["c_nianhao_chn"]

    a = pd.concat(
        [
            df[["person_id", "w_dob", "w_dod"]].drop_duplicates(subset="person_id").rename(
                columns={"person_id": "id", "w_dob": "dob", "w_dod": "dod"}),
            df[["assoc_id", "a_dob", "a_dod"]].drop_duplicates(subset="assoc_id").rename(
                columns={"assoc_id": "id", "a_dob": "dob", "a_dod": "dod"})
        ]
    ).drop_duplicates(subset="id").dropna(subset=["id"])
    a["id"] = a["id"].astype(int)
    a["nianhao"] = pd.cut(a["dob"], bins=bins, labels=labels)
    a.set_index("id", inplace=True)
    year_dict = a.to_dict(orient="index")
    for key, val in year_dict.items():
        val["dob"] = int(val["dob"]) if pd.notna(val["dob"]) else None
        val["dod"] = int(val["dod"]) if pd.notna(val["dod"]) else None
        val["nianhao"] = val["nianhao"] if pd.notna(val["nianhao"]) else "不详"
    return year_dict


def generate_colors(path, nianhao_df):
    # 统计node里有多少个年号，并为每个年号生成一种颜色（按时间顺序从色带里面插值得到）
    with open(path) as f:
        text = f.readlines()[0]
    nodes = json.loads(text)["nodes"]
    exist_labels = pd.DataFrame(nodes)["nianhao"].unique().tolist()
    labels = nianhao_df["c_nianhao_chn"].values.tolist()
    for label in labels:
        if label not in exist_labels:
            labels.remove(label)

    # 颜色插值
    st = -2
    ed = len(labels) + 2
    dur = ed - st
    for i in range(len(labels)):
        c = plt.cm.magma((np.clip(i, st, ed) - st) / dur * 1.0)[:3]  # cubehelix是色带名称
        print(f"'{labels[i]}': '{RGB_to_Hex(c)}',")
    print("'不详': '#a0a0a0'")


def RGB_to_Hex(rgb):
    color = '#'
    for i in rgb:
        num = int(i*256)
        color += str(hex(num))[-2:]
    return color


if __name__ == "__main__":
    df = pd.read_csv("明代书信清洗补充.csv")
    nianhao_df = pd.read_csv("明朝年号.txt")

    # 生成图数据
    # agg_num = 30  # agg=5:1257 3935  526 371
    # nodes, links = process_graph(df, nianhao_df, agg_num)
    # print(len(nodes), len(links))
    # save_graph(nodes, links, "datavis_f21_group6_final_src/data/graph.json")

    # 生成结点颜色
    generate_colors("datavis_f21_group6_final_src/data/graph.json", nianhao_df)

    # todo js：找合适的节点大小、边粗细映射函数
    # todo js：找好看的节点颜色
