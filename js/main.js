const config = {
    url: "https://api.recursionist.io/builder/computers?type=",
    cpuBrandSelectId: "cpuBrandSelect",
    cpuModelSelectId: "cpuModelSelect",
    gpuBrandSelectId: "gpuBrandSelect",
    gpuModelSelectId: "gpuModelSelect",
    ramNumSelectId: "ramNumSelect",
    ramBrandSelectId: "ramBrandSelect",
    ramModelSelectId: "ramModelSelect",
    storageTypeSelectId: "storageTypeSelect",
    storageCapacitySelectId: "storageCapacitySelect",
    storageBrandSelectId: "storageBrandSelect",
    storageModelSelectId: "storageModelSelect",
    pcPerformanceEvaluateBtnId : "pc-performance-evaluate-btn",
    storageType: "",
    "cpu": {
        "brand": "",
        "model": "",
        "benchmark": 0
    },
    "gpu": {
        "brand": "",
        "model": "",
        "benchmark": 0
    },
    "ram": {
        "brand": "",
        "model": "",
        "benchmark": 0
    },
    "hdd": {
        "brand": "",
        "model": "",
        "benchmark": 0
    },
    "ssd": {
        "brand": "",
        "model": "",
        "benchmark": 0
    },
    count: 1
}

// CPU Modelのオプションを作成
function generateCPUModelOptions(cpuBrand){
    cpuModelArr = []

    fetch(config.url+"cpu").then(response=>response.json()).then(function(data){
        for (i in data) {
            if ((data[i].Brand === cpuBrand) && !(cpuModelArr.includes(data[i].Model))) {
                cpuModelArr.push(data[i].Model);
            };
        };

        let cpuModelSelect = document.getElementById(config.cpuModelSelectId);
        cpuModelSelect.innerHTML = "";
        cpuModelSelect.insertAdjacentHTML('beforeend', generateOptions(cpuModelArr));
    });
};

// GPU Modelのオプションを作成
function generateGPUModelOptions(gpuBrand){
    gpuModelArr = []

    fetch(config.url+"gpu").then(response=>response.json()).then(function(data){
        for (i in data) {
            if ((data[i].Brand === gpuBrand) && !(gpuModelArr.includes(data[i].Model))) {
                
                gpuModelArr.push(data[i].Model);
            };
        };

        let gpuModelSelect = document.getElementById(config.gpuModelSelectId);
        gpuModelSelect.innerHTML = "";
        gpuModelSelect.insertAdjacentHTML('beforeend', generateOptions(gpuModelArr));
    });
};

// RAM Brandのオプションを作成
function generateRAMBrandOptions(ramNum){
    ramBrandArr = []
    fetch(config.url+"ram").then(response=>response.json()).then(function(data){
        for (i in data) {
            let splitModelName = data[i].Model.split(" ");
            let memorySlotNum = splitModelName[splitModelName.length - 1][0];

            if (ramNum === memorySlotNum && !(ramBrandArr.includes(data[i].Brand))) {
                ramBrandArr.push(data[i].Brand);
            };
        };

        let ramBrandSelect = document.getElementById(config.ramBrandSelectId);
        ramBrandSelect.innerHTML = "";
        ramBrandSelect.insertAdjacentHTML('beforeend', generateOptions(ramBrandArr));
    });
}

// RAM Modelのオプションを作成
function generateRAMModelOptions(ramBrand, ramNum){
    ramModelArr = []

    fetch(config.url+"ram").then(response=>response.json()).then(function(data){
        for (i in data) {
            let splitModelName = data[i].Model.split(" ");
            // console.log(splitModelName[splitModelName.length - 1][0]);
            let memorySlotNum = splitModelName[splitModelName.length - 1][0];

            // if (ramNum === memorySlotNum && !(ramBrandArr.includes(data[i].Brand))) {
            if ((data[i].Brand === ramBrand) && ramNum === memorySlotNum && !(ramModelArr.includes(data[i].Model))) {
                ramModelArr.push(data[i].Model);
            };
        };

        let ramModelSelect = document.getElementById(config.ramModelSelectId);
        ramModelSelect.innerHTML = "";
        ramModelSelect.insertAdjacentHTML('beforeend', generateOptions(ramModelArr));
    });
};

//  Storage容量のオプションを作成
function generateStorageCapacityOptions(storageType){
    let storageCapacityArr = []

    // capacityを降順に並び替えるための関数
    function compareFn(a, b){
        return b - a;
    }

    if (storageType === "HDD"){
        fetch(config.url+"hdd").then(response=>response.json()).then(function(data){
            for (i in data) {
                let model = data[i].Model;
                insertIntCapacity(model, storageCapacityArr);
            };
            // console.log(storageCapacityArr);

            // capacityを降順に並び替えて、単位を付与し直す
            storageCapacityArr.sort(compareFn);
            for (let i = 0; i < storageCapacityArr.length; i++){
                storageCapacityArr[i] = capacityToString(storageCapacityArr[i]);
            }

            let storageCapacitySelect = document.getElementById(config.storageCapacitySelectId);
            storageCapacitySelect.innerHTML = "";
            storageCapacitySelect.insertAdjacentHTML('beforeend', generateOptions(storageCapacityArr));
        });
    } else {
        fetch(config.url+"ssd").then(response=>response.json()).then(function(data){
            for (i in data) {
                let model = data[i].Model;
                insertIntCapacity(model, storageCapacityArr);
            };

            // capacityを降順に並び替えて、単位を付与し直す
            storageCapacityArr.sort(compareFn);
            for (let i = 0; i < storageCapacityArr.length; i++){
                storageCapacityArr[i] = capacityToString(storageCapacityArr[i]);
            }

            let storageCapacitySelect = document.getElementById(config.storageCapacitySelectId);
            storageCapacitySelect.innerHTML = "";
            storageCapacitySelect.insertAdjacentHTML('beforeend', generateOptions(storageCapacityArr));
        });
    }
};

// capacityから単位を取り除いて、配列に格納する（後で降順に並べ替えられるようにするため）
function insertIntCapacity(storageModel, arr){
    // HDDモデルの容量に（）がついていた場合は、除去する
    let re = /\s\(.*?\)/;
    if (re.test(storageModel)) {
        storageModel = storageModel.replace(storageModel.match(re)[0], "");
    }

    let splitModelName = storageModel.split(" ");
    let capacity = splitModelName[splitModelName.length - 1];

    let tbRe = /TB/;
    let gbRe = /GB/;
    if (tbRe.test(capacity)){
        capacity = parseFloat(capacity.replace("TB", "")) * 1000;
    } else if (gbRe.test(capacity)){
        capacity = parseFloat(capacity.replace("GB", ""));
    }

    if (!(arr.includes(capacity))){
        arr.push(capacity);
    };
    return arr;
}

// capacityを文字列に変換し、単位を付与する
function capacityToString(capacity){
    if ((capacity / 1000) >= 1) {
        return String(capacity / 1000) + "TB";
    } else {
        return String(capacity) + "GB";
    }
}

function generateStorageBrandOptions(storageType, capacity){
    storageBrandArr = []
    fetch(config.url+storageType.toLowerCase()).then(response=>response.json()).then(function(data){
        for (i in data) {
            // console.log(data[i]);
            let s = data[i].Brand;
            let re = /\s\(.*?\)/;

            let model = data[i].Model;
            if (re.test(model)) {
                model = model.replace(model.match(re)[0], "");
            }
        
            let splitModelName = model.split(" ");
            let modelCapacity = splitModelName[splitModelName.length - 1];

            if (!(storageBrandArr.includes(data[i].Brand)) && modelCapacity === capacity) {
                storageBrandArr.push(data[i].Brand);
            };
        };

        let storageBrandSelect = document.getElementById(config.storageBrandSelectId);
        storageBrandSelect.innerHTML = "";
        storageBrandSelect.insertAdjacentHTML('beforeend', generateOptions(storageBrandArr));
    });
}

function generateStorageModelOptions(storageType, capacity, brand){
    storageModelArr = []
    fetch(config.url+storageType.toLowerCase()).then(response=>response.json()).then(function(data){
        for (i in data) {
            // console.log(data[i]);
            let s = data[i].Brand;
            let re = /\s\(.*?\)/;

            let model = data[i].Model;
            if (re.test(model)) {
                model = model.replace(model.match(re)[0], "");
            }
        
            let splitModelName = model.split(" ");
            let modelCapacity = splitModelName[splitModelName.length - 1];

            if (!(storageModelArr.includes(data[i].Model)) && modelCapacity === capacity && data[i].Brand === brand) {
                storageModelArr.push(data[i].Model);
            };
        };

        let storageModelSelect = document.getElementById(config.storageModelSelectId);
        storageModelSelect.innerHTML = "";
        storageModelSelect.insertAdjacentHTML('beforeend', generateOptions(storageModelArr));
    });
}


/* イベント操作 */

// CPUブランド選択イベント
let cpuBrandSelect = document.getElementById(config.cpuBrandSelectId);
cpuBrandSelect.addEventListener('change', function(e){
    let cpuBrand = e.target.value;
    // console.log(cpuBrand);
    config["cpu"]["brand"] = cpuBrand;
    generateCPUModelOptions(cpuBrand);
})

// CPUモデル選択イベント
let cpuModelSelect = document.getElementById(config.cpuModelSelectId);
cpuModelSelect.addEventListener('change', function(e){
    let cpuModel = e.target.value;
    // console.log(cpuBrand);
    config["cpu"]["model"] = cpuModel;
})

// GPUブランド選択イベント
let gpuBrandSelect = document.getElementById(config.gpuBrandSelectId);
gpuBrandSelect.addEventListener('change', function(e){
    let gpuBrand = e.target.value;
    // console.log(gpuBrand);
    config["gpu"]["brand"] = gpuBrand;
    generateGPUModelOptions(gpuBrand);
})

// GPUモデル選択イベント
let gpuModelSelect = document.getElementById(config.gpuModelSelectId);
gpuModelSelect.addEventListener('change', function(e){
    let gpuModel = e.target.value;
    // console.log(gpuBrand);
    config["gpu"]["model"] = gpuModel;
})

// RAM個数選択イベント
let ramNumSelect = document.getElementById(config.ramNumSelectId);
ramNumSelect.addEventListener('change', function(e){
    let ramNum = e.target.value;
    // console.log(ramNum);
    generateRAMBrandOptions(ramNum);
})

// RAMブランド選択イベント
let ramBrandSelect = document.getElementById(config.ramBrandSelectId);
ramBrandSelect.addEventListener('change', function(e){
    let ramBrand = e.target.value;
    config["ram"]["brand"] = ramBrand;
    generateRAMModelOptions(ramBrand, ramNumSelect.value);
})

// RAMモデル選択イベント
let ramModelSelect = document.getElementById(config.ramModelSelectId);
ramModelSelect.addEventListener('change', function(e){
    let ramModel = e.target.value;
    config["ram"]["model"] = ramModel;
})

// Storageタイプ選択イベント
let storageTypeSelect = document.getElementById(config.storageTypeSelectId);
storageTypeSelect.addEventListener('change', function(e){
    let storageType = e.target.value;
    // console.log(storageType);
    config.storageType = storageType;
    generateStorageCapacityOptions(storageType);
})

// Storage Capacity選択イベント
let storageCapacitySelect = document.getElementById(config.storageCapacitySelectId);
storageCapacitySelect.addEventListener('change', function(e){
    let capacity = e.target.value;
    generateStorageBrandOptions(storageTypeSelect.value, capacity);
})

// Storage Brand選択イベント
let storageBrandSelect = document.getElementById(config.storageBrandSelectId);
storageBrandSelect.addEventListener('change', function(e){
    let brand = e.target.value;
    if (storageTypeSelect.value === "HDD"){
        config["hdd"]["brand"] = brand;
    } else {
        config["ssd"]["brand"] = brand;
    }
    generateStorageModelOptions(storageTypeSelect.value, storageCapacitySelect.value, brand);
})

// Storage Model選択イベント
let storageModelSelect = document.getElementById(config.storageModelSelectId);
storageModelSelect.addEventListener('change', function(e){
    let model = e.target.value;
    if (storageTypeSelect.value === "HDD"){
        config["hdd"]["model"] = model;
    } else {
        config["ssd"]["model"] = model;
    }
})

// ボタンが押された時のイベント
let button = document.getElementById(config.pcPerformanceEvaluateBtnId);
button.addEventListener("click", function(){
    if (isAllFormFilledIn()){
        computePcSpec();
    }
})


//全ての項目が選択されているかチェックする
function isAllFormFilledIn(){
    let selectItems = [
        config.cpuBrandSelectId, 
        config.cpuModelSelectId, 
        config.gpuBrandSelectId, 
        config.gpuModelSelectId, 
        config.ramNumSelectId, 
        config.ramBrandSelectId, 
        config.ramModelSelectId, 
        config.storageTypeSelectId, 
        config.storageCapacitySelectId, 
        config.storageBrandSelectId, 
        config.storageModelSelectId
    ];

    for (let i = 0; i < selectItems.length; i++){
        if (document.getElementById(selectItems[i]).selectedIndex === 0){
            alert("Please fill in all forms.");
            return false;
        };
    };
    return true;
}

// オプション作成関数
function generateOptions(optionArr) {

    let options = `<option>-</option>`;

    for (i in optionArr) {
        options += `<option value='${optionArr[i]}'>${optionArr[i]}</option>`;
    }
    // console.log(options);
    return options;
}

function setBenchmarks(parts){
    // console.log(partsInfo[i]);
    fetch(config.url+parts).then(response=>response.json()).then(function(data){
        for (i in data) {
            if (data[i].Brand === config[parts]["brand"] && data[i].Model === config[parts]["model"]) {
                // console.log(data[i].Benchmark);
                config[parts]["benchmark"] = data[i].Benchmark;
            };
        };
    });
}

function computePcSpec(){
    let gaming = 0;
    let working = 0;
    const partsInfo = ["cpu", "gpu", "ram", config.storageType === "HDD" ? "hdd" : "ssd"];
    for (i = 0; i < partsInfo.length; i++){
        setBenchmarks(partsInfo[i]);
    }

    //ベンチマークの値の取得を優先させるため、非同期処理を行う
    setTimeout(() => {
        gaming +=  config["cpu"]["benchmark"] * 0.25;
        gaming += config["gpu"]["benchmark"] * 0.6;
        gaming += config["ram"]["benchmark"] * 0.125;
        gaming += config[config.storageType === "HDD" ? "hdd" : "ssd"]["benchmark"] * 0.025
        gaming = Math.floor(gaming);

        working += config["cpu"]["benchmark"] * 0.6;
        working += config["gpu"]["benchmark"] * 0.25;
        working += config["ram"]["benchmark"] * 0.1;
        working += config[config.storageType === "HDD" ? "hdd" : "ssd"]["benchmark"] * 0.05;
        working = Math.floor(working);

    // cardの作成
        let card = generatePCSpecCard(gaming, working);
        let target = document.getElementById("pc-spec-result");
        target.append(card);
        config.count += 1;
    }, 500);
}

function generatePCSpecCard(gaming, working){
    let card = document.createElement("div");
    card.classList.add("d-flex", "justify-content-center", "mt-4");
    let htmlString =
    `
        <div class="col-8">
            <div class="card">
                <h3 class="card-header text-center">Your PC ${config.count}</h3>
                <div class="card-body">
                    <div class="row text-center">
                        <h3 class="col-6">Gaming: ${gaming}%</h3>
                        <h3 class="col-6">Working: ${working}%</h3>
                    </div>
                    <div class="row mt-3">
                        <table class="table table-striped text-center">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">Parts</th>
                                    <th scope="col">Brand</th>
                                    <th scope="col">Model</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">CPU</th>
                                    <td>${config["cpu"]["brand"]}</td>
                                    <td>${config["cpu"]["model"]}</td>
                                </tr>
                                <tr>
                                    <th scope="row">GPU</th>
                                    <td>${config["gpu"]["brand"]}</td>
                                    <td>${config["gpu"]["model"]}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Memory</th>
                                    <td>${config["ram"]["brand"]}</td>
                                    <td>${config["ram"]["model"]}</td>
                                </tr>
                                <tr>
                                    <th scope="row">${config.storageType}</th>
                                    <td>${config[config.storageType === "HDD" ? "hdd" : "ssd"]["brand"]}</td>
                                    <td>${config[config.storageType === "HDD" ? "hdd" : "ssd"]["model"]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    card.innerHTML = htmlString;
    return card;
}
