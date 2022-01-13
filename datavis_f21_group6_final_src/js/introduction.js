
function generate_introduction(person_id) {
    let person_data = profile_data[person_id];
    if(person_data===null) clear_introdcution();
    $('.person_name').html(person_data.name);
    $('#birthyear').html((person_data.birth_year?person_data.birth_year:'未详') 
        + '(' + person_data.nianhao + ')'
        + '-' + (person_data.death_year?person_data.death_year:'未详'));
    if(JSON.stringify(person_data.penpal)!=='{}'){
        let penpal = person_data.penpal;
        let content = ''
        
        // 寄信情况
        if(penpal.count_max[0]>0){
            content = '寄出信件共'+ penpal.write_sum + '封，其中寄给<a class="person_name_inline">' 
            + profile_data[penpal.count_max[1]].name+ '</a>'+ penpal.count_max[0] + '封；';
        } else{
            content = '无寄出信件；'
        }
        $('#write_letter').html(content);

        // 收信情况
        if(penpal.count_min[0]<0){
            content = '收到信件共'+ penpal.receive_sum + '封，其中收到<a class="person_name_inline">' 
            + profile_data[penpal.count_min[1]].name + '</a>'+ (-penpal.count_min[0]) + '封；';
        } else{
            content = '无收到信件；'
        }
        $('#receive_letter').html(content);

        // 年龄情况
        content = '最年长的通信对象为<a class="person_name_inline">' + profile_data[penpal.year_min[1]].name + '</a>(年长' + (person_data.birth_year-penpal.year_min[0]) + '岁)；'
        + '最年轻的通信对象为<a class="person_name_inline">' + profile_data[penpal.year_max[1]].name + '</a>(年轻' + (penpal.year_max[0]-person_data.birth_year) + '岁)；'
        if(penpal.std)
            content += '通信对象年龄差标准差为' + penpal.std.toFixed(1) + '岁。'; 
        $('#std').html(content);
    }else{
        $('#write_letter').html('无通信对象信息。');
    }
}

function clear_introdcution(){
    $('.person_name').html('人物简介');
    $('#birthyear').html('');
    $('#deathyear').html('');
    $('#write_letter').html('');
    $('#receive_letter').html('');
    $('#std').html('');
}

function init_introduction(){
    $('.person_name').html('人物简介');
    $('#birthyear').html('明代书信社交网络中共有2409人，书信28,535封；');
    $('#write_letter').html('其中写信最多的人是<a class="person_name_inline">申时行</a>，共寄出1803封信；');
    $('#receive_letter').html('其中收信最多的人是<a class="person_name_inline">鄭洛</a>，共收到126封信；');
    $('#std').html('其中通信对象年龄差标准差最大的是<a class="person_name_inline">焦竑</a>（45.8岁）。');
}