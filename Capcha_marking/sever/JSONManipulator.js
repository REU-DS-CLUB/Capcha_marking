class JSONManipulator {

  generate_uniq_key () {
    return Date.now().toString(36);
  }

  // возращает содержания json 
  read(filePath) {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  // созддает пустой json
  create_json(image_id, object_name, layout) { 
    const fs = require('fs');
    let tmp_json = {"id": this.generate_uniq_key(),
    "image_id": image_id,"object_name": object_name,"layout": layout};
    let tmp_object_area = {};
    for (let w = 0; w < layout[0]; w++) {
        for (let h = 0; h < layout[1]; h++) {
            tmp_object_area[((w + 1) +":" + (h+ 1))] = 0;
        }
    }
    tmp_json["object_area"] = tmp_object_area;
    
    fs.writeFile('./data/untrasted/'+tmp_json['id']+'.json', JSON.stringify(tmp_json, null, 2), 'utf-8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File ' + image_id + '.json created successfully.');
    });  
  }


  // меняет в определенном json значение фидов на определ знач 
  //!!! filds - массив пример ["1:1", "2:1"], первая цифра - Х, вторая - Y
  // разделяются ":"
  change_field_by(change, id, fields) { 
    const full_json_name = "./data/untrasted/"+ id + ".json";
    const fs = require('fs');
    let data = JSON.parse(fs.readFileSync(full_json_name, 'utf-8'));

    for (let w = 0; w < data.layout[0]; w++) {
      for (let h = 0; h < data.layout[1]; h++) {
          let tmp_field = ((w + 1) +":" + (h+ 1));
          if (fields.includes(tmp_field)) {
            data.object_area[tmp_field] += change;
          } 
      }
    }
    fs.writeFileSync(full_json_name, JSON.stringify(data, null, 2), "utf-8");
  }

  // !!! не работает (не хочет возращать значение)
  // должен возращать все недоверенные json's id
  return_all_untrasted_id() { 
    
    const fs = require('fs');
    const path = require('path');
    const jsonFiles = [];
    const folderPath = './data/untrasted';

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }

      files.forEach((file) => {
        if (path.extname(file) === '.json') {
          jsonFiles.push(path.basename(file, '.json'));
        }
      });
      console.log(jsonFiles);
      
    });
    return jsonFiles;
  }

}

module.exports = JSONManipulator;
