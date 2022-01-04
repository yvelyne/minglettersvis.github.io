import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt


def get_year(person_id, year_dict):
    birthyear = year_dict[person_id]["dob"]
    deathyear = year_dict[person_id]["dod"]
    nianhao = year_dict[person_id]["nianhao"]
    return birthyear, deathyear, nianhao


def process_graph(df, year_dict, agg_num):
    agg_id = 600000
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


def get_all_person_id(df):
    # 所有人的id
    all_id = pd.concat(
        [
            df[["person_id", "writer", "w_dob", "w_dod"]].drop_duplicates(subset="person_id").rename(
                columns={"person_id": "id", "writer": "name", "w_dob": "dob", "w_dod": "dod"}),
            df[["assoc_id", "assoc_name", "a_dob", "a_dod"]].drop_duplicates(subset="assoc_id").rename(
                columns={"assoc_id": "id", "assoc_name": "name", "a_dob": "dob", "a_dod": "dod"})
        ],
        ignore_index=True
    ).drop_duplicates(subset="id").dropna(subset=["id"])
    all_id["id"] = all_id["id"].astype(int)
    return all_id


def generate_profile(df, nianhao_df, save_path):
    # 年号
    # 去重
    nianhao_df.drop_duplicates(subset="c_firstyear", keep='last', inplace=True)
    # 去掉北元
    nianhao_df = nianhao_df.query("c_dynasty_chn!='北元'")
    bins = nianhao_df["c_firstyear"].values.tolist() + [nianhao_df["c_lastyear"].iloc[-1]]
    labels = nianhao_df["c_nianhao_chn"]

    all_id = get_all_person_id(df)
    all_id["nianhao"] = pd.cut(all_id["dob"], bins=bins, labels=labels)
    all_id["nianhao"] = all_id["nianhao"].astype(str).fillna('未详')
    all_id.set_index("id", inplace=True)
    all_id = all_id.where((all_id.notna()), None)
    profile_dict = all_id.to_dict(orient="index")

    data = {}
    # 遍历
    for key, val in profile_dict.items():
        print(val["name"])
        # 生卒年
        val["dob"] = int(val["dob"]) if val["dob"] is not None else None
        val["dod"] = int(val["dod"]) if val["dod"] is not None else None
        val["nianhao"] = val["nianhao"]
        data[key] = {
            "id": key,
            "name": val["name"],
            "birth_year": val["dob"],
            "death_year": val["dod"],
            "nianhao": val["nianhao"],
        }
        penpal = penpal_distribution(key, df)

        # 处理生年为空，使penpal为空
        if penpal[penpal["dob"].notna()].shape[0] == 0:  # 所有笔友都生年为空
            data[key]["penpal"] = {}
            continue
        birthyear_plot = val["dob"] if val["dob"] is not None else int(penpal["dob"].mean())

        # 年龄差标准差
        std = None
        if val["dob"] is not None:
            std = (penpal["dob"] - val["dob"]).std()  # 只有一个笔友的情况，std为nan
        std = None if pd.isna(std) else std

        # 加上自身
        penpal = pd.concat([penpal, pd.DataFrame({
            "id": int(key),
            "count": 0,
            "dob": birthyear_plot,
            "type": "self"
        }, index=[0])])

        # 计算范围
        year_min = int(penpal["dob"].min())
        year_max = int(penpal["dob"].max())
        year_delta = [birthyear_plot-year_min, birthyear_plot-year_max]
        count_max = int(penpal["count"].fillna(0).max())
        count_min = int(penpal["count"].fillna(0).min())

        data[key]["penpal"] = {
            "std": std,
            "year_delta": year_delta,
            "year_min": [year_min, get_person_id(penpal, f"dob=={year_min} and id!={key}")],
            "year_max": [year_max, get_person_id(penpal, f"dob=={year_max} and id!={key}")],
            "count_max": [count_max, get_person_id(penpal, f"count=={count_max} and id!={key}")],
            "count_min": [count_min, get_person_id(penpal, f"count=={count_min} and id!={key}")],
            "write_sum": int(penpal.query("type=='write'")["count"].sum()),
            "receive_sum": int(penpal.query("type=='receive'")["count"].sum()),
            "points": penpal.to_dict(orient="records")
        }
    with open(save_path, "w") as f:
        f.write(json.dumps(data))


def get_person_id(penpal, constraint):
    temp = penpal.query(constraint)["id"]
    try:
        return int(temp.iloc[0])
    except:
        return None

def generate_colors(nianhao_df):
    # 为每个年号生成一种颜色（按时间顺序从色带里面插值得到）
    nianhao_dict = nianhao_df[['c_nianhao_chn', 'c_firstyear', 'c_lastyear']].rename(columns={'c_firstyear':'firstyear', 'c_lastyear':'lastyear','c_nianhao_chn':"nianhao"})\
    .to_dict(orient='records')

    # 颜色插值
    st = 1250
    ed = 1670
    dur = ed - st
    for item in nianhao_dict:
        c = plt.cm.magma((np.clip((item['firstyear']+item['lastyear'])/2, st, ed) - st) / dur * 1.0)[:3]  # cubehelix是色带名称
        print(f"'{item['nianhao']}': '{RGB_to_Hex(c)}',")
    print("'不详': '#a0a0a0'")


def RGB_to_Hex(rgb):
    color = '#'
    for i in rgb:
        num = int(i*256)
        color += str(hex(num))[-2:].replace('x', '0')
    return color


def penpal_distribution(person_id, df):
    # 写信
    write = df.query(f"person_id=={person_id} and assoc_id.notna()").copy()  # 去除没有信息的收信人
    write["assoc_id"] = write["assoc_id"].astype(int)
    # 计算写给每个收信人的信件数量
    write = write.groupby("assoc_id", as_index=False)[["line"]].count()
    write.rename(columns={"line": "count"}, inplace=True)
    write = write.merge(df.drop_duplicates(subset="assoc_id")[["assoc_id", "a_dob"]], on="assoc_id")
    write["a_dob"] = write["a_dob"].fillna(write["a_dob"].mean())  # 用收信人平均出生年份填充空值
    write["type"] = "write"
    write.rename(columns={"a_dob": "dob", "assoc_id": "id"}, inplace=True)

    # 收信
    assoc = df.query(f"assoc_id=={person_id} and person_id.notna()").copy()
    assoc["person_id"] = assoc["person_id"].astype(int)
    assoc = assoc.groupby("person_id", as_index=False)[["line"]].count()
    assoc.rename(columns={"line": "count"}, inplace=True)
    assoc = assoc.merge(df.drop_duplicates(subset="person_id")[["person_id", "w_dob"]])
    assoc["w_dob"] = assoc["w_dob"].fillna(assoc["w_dob"].mean())
    assoc["type"] = "receive"
    assoc["count"] = assoc["count"] * -1
    assoc.rename(columns={"w_dob": "dob", "person_id": "id"}, inplace=True)

    penpal = pd.concat([write, assoc])
    penpal = penpal.where((penpal.notna()), None)
    try:
        penpal["dob"] = penpal["dob"].astype(int)
    except:
        pass
    return penpal


def get_letter(df, save_path):
    all_id = get_all_person_id(df)
    data = {}
    for idx in all_id.index:
        person_id = int(all_id.loc[idx, "id"])
        print(person_id)
        # 寄信
        write = df.query(f"person_id=={person_id}")[
            ["title", "assoc_id", "assoc_name", "collection"]]\
            .rename(columns={"assoc_id": "penpal_id", "assoc_name": "penpal_name"})\
            .sort_values(by="penpal_id")
        write["title"] = write["title"].apply(lambda x: x.strip())
        write["type"] = "寄"
        write1 = write.query("penpal_id.notna()").copy()
        write1["penpal_id"] = write1["penpal_id"].astype(int)
        write2 = write.query("penpal_id.isna()").copy()
        write2 = write2.where((write2.notna()), '')

        # 收信
        receive = df.query(f"assoc_id=={person_id}")[
            ["title", "person_id", "writer", "collection"]] \
            .rename(columns={"person_id": "penpal_id", "writer": "penpal_name"}) \
            .sort_values(by="penpal_id")
        receive["title"] = receive["title"].apply(lambda x: x.strip())
        receive["type"] = "收"
        receive1 = receive.query("penpal_id.notna()").copy()
        receive1["penpal_id"] = receive1["penpal_id"].astype(int)
        receive2 = receive.query("penpal_id.isna()").copy()
        receive2 = receive2.where((receive2.notna()), '')

        # 整合
        data[person_id] = write1.to_dict(orient="records") + write2.to_dict(orient="records") \
            + receive1.to_dict(orient="records") + receive2.to_dict(orient="records")

    with open(save_path, "w") as f:
        f.write(json.dumps(data))


if __name__ == "__main__":
    df = pd.read_csv("明代书信清洗补充.csv")
    nianhao_df = pd.read_csv("明朝年号.txt")

    # 生成人物数据
    profile_path = "datavis_f21_group6_final_src/data/profile_data.json"
    generate_profile(df, nianhao_df, profile_path)

    # 生成书信数据
    # get_letter(df, "datavis_f21_group6_final_src/data/letter.json")

    # 生成图数据
    # with open(profile_path, "r") as f:
    #      text = f.readlines()[0]
    # profile_dict = json.loads(text)
    # agg_num = 30  # agg=5:1257 3935  526 371
    # nodes, links = process_graph(df, nianhao_df, agg_num)
    # print(len(nodes), len(links))
    # save_graph(nodes, links, "datavis_f21_group6_final_src/data/graph.json")

    # 生成结点颜色
    # generate_colors("datavis_f21_group6_final_src/data/graph.json", nianhao_df)

    # todo js：找合适的节点大小、边粗细映射函数
    # todo js：找好看的节点颜色
