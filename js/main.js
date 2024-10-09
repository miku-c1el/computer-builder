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
    count: 1,
    CPU: []
}

class Computer{
    static componentsName = ["cpu", "gpu", "ram", "storage"];
    components = {
        cpu: null,
        gpu: null,
        ram: null,
        storage: null
    };
    #num = 0;

    constructor(){
        this.#num += 1;
    }

    calculateGamingTotalScore(){
        
    }

    calculateWorkingTotalScore(){

    }

    addComponent(){
        
    }
}

class Component{
    #brand;
    #model;
    #benchmarkScore;

    constructor(brand, model, benchmark){
        this.#brand = brand;
        this.#model = model;
        this.#benchmarkScore = benchmark;
    }
}

// class CPU extends Component{
//     constructor(brand, model, benchmark){
//         super(brand, model, benchmark);
//     }
// }

// class GPU extends Component{
//     constructor(brand, model, benchmark){
//         super(brand, model, benchmark);
//     }
// }

class RAM extends Component{
    #num;
    constructor(brand, model, num, benchmark){
        super(brand, model, benchmark);
        this.#num = num;
    }
}

class Storage extends Component{
    #type;
    #capacity;

    constructor(brand, model, type, capacity, benchmark){
        super(brand, model, benchmark);
        this.#type = type;
        this.#capacity = capacity;
    }
}

class Controller{
    #computer = null;
    static componentsData = {
        "cpu": null,
        "gpu": null,
        "ram": null,
        "storage": {
            "hdd": null,
            "ssd" : null
        }
    }

    // apiを叩いて各部品のデータを取得する
    static getComponentData(){
        for (let component in this.componentsData){
            //storageは初期化でssdのデータを取得する
            if (component == "storage"){
                for (let storageType in Controller.componentsData["storage"]){
                    fetch(config.url+storageType).then(response=>response.json()).then(data => {
                        this.componentsData["storage"][storageType] = data;
                    });
                }
            } else {
                fetch(config.url+component).then(response=>response.json()).then(data => {
                    this.componentsData[component] = data;
                });
            }
        }
    }

    static getOptionItems(componentName, label){
        let optionItems;
        if (label === "How Many"){
            optionItems = this.componentsData[componentName].map(component => component["Model"]);
        } else if (label === "HDD or SSD") {
            let ssd = this.componentsData[componentName]["ssd"].map(component => component["Type"]);
            let hdd = this.componentsData[componentName]["hdd"].map(component => component["Type"])
            optionItems = ssd.concat(hdd);
        } else if (label === "Storage"){
            optionItems = this.componentsData[componentName].map(component => component["Model"]);
        } else {
            optionItems = this.componentsData[componentName].map(component => component[label]);
        }
        // console.log(label);
        return new Set(optionItems);
    }

    static filterOptions(){

    }

    /* computerオブジェクトを関数内で定義していることに対する違和感あり。
    依存性注入を適応した方が良さそう(ボタンが押された時かな?) */
    getUserSelectedOption(){
        // compoent = {"componentName": componentObj}
        this.computer = new Computer();
        computer.componentsName.forEach((componentName) =>{
            const brand = document.getElementById("form-select-" + componentName + "-brand");
            const model = document.getElementById("form-select-cpu-" + componentName + "-model");
            const benchmark = /* benchmarkを取得する */null;

            // storageオブジェクトの作成
            let component;
            if(componentName == "storage"){
                const type = document.getElementById("form-select-storage-type");
                const capacity = document.getElementById("form-select-storage-capacity");
                component = new Storage(brand, model, type, capacity, benchmark);
            } else if (componentName == "ram"){
                const num = document.getElementById("form-select-ram-num");
                component = new RAM(brand, model, num, benchmark);
            } else {
                component = new Component(brand, model);
            }
            this.#computer.components[componentName] = component;
        })
    }
}

class View{
    #isInitialized;
    static componentLabels = {
        "cpu": ["Brand", "Model"],
        "gpu": ["Brand", "Model"],
        "ram": ["How Many", "Brand", "Model"],
        "storage": ["HDD or SSD", "Storage", "Brand", "Model"],
    };

    constructor(){
        this.#isInitialized = false;
    }

    get isInitialized(){
        return this.#isInitialized;
    }

    // オプションを作成
    generateDropdownOptions(optionArr) {

        let options = `<option>-</option>`;
    
        for (let item of optionArr) {
            options += `<option value='${item}'>${item}</option>`;
        }

        return options;
    }

    // select要素を作成
    generateSelectEle(label, component, isInitialized){
        let formGroup = document.createElement("div");
        formGroup.classList.add("form-group", "col-lg-3");
        let labelEle = document.createElement("label");
        labelEle.innerHTML = label;

        let selectEle = document.createElement("select");
        selectEle.classList.add("form-control");
        selectEle.id = component + label + "Select";

        // オプションを取得して、select要素に追加する
        let optionItems;
        
        // 初回アクセスの時、
        if (isInitialized === false){
            // if(component === "ram" && label != "How Many"){
            //     console.log(component);
            //     console.log(label);
            // }

            if ((component === "ram" && label != "How Many") || (component === "storage" && label != "HDD or SSD") || ((component == "cpu" || component == "gpu") && label != "Brand")){
                optionItems = [];
            } else {
                optionItems = Controller.getOptionItems(component, label);
            }
            // console.log("h");
        } else {
            optionItems = Controller.getOptionItems(component, label);
            // console.log("j");
        }
        
        let dropdownOption = this.generateDropdownOptions(optionItems);
        selectEle.innerHTML = dropdownOption;

        formGroup.append(labelEle);
        formGroup.append(selectEle);
        return formGroup;
    }

    // 各部品のselection要素を含んだカードを作成
    generateComponentSelectionCard(componentName){
        // タイトル
        let selectTitle = document.createElement("h4");
        selectTitle.classList.add("mt-4", "border", "border-warning");
        selectTitle.innerHTML = componentName.toUpperCase();

        let row = document.createElement("div");
        row.classList.add("form-row", "border", "border-warning");

        let target = document.getElementById("target");
        
        let labels = View.componentLabels[componentName]
        for (let i in labels){
            let selectEle = this.generateSelectEle(labels[i], componentName, this.#isInitialized);
            row.append(selectEle);
        }

        target.append(selectTitle);
        target.append(row);
    }

    generateSelectPage(){
        // 各部品のselect要素を作成
        for (let label in View.componentLabels){
            this.generateComponentSelectionCard(label);
        }
    }
    // function generateCPUModelOptions(cpuBrand){
    //     cpuModelArr = []
    
    //     fetch(config.url+"cpu").then(response=>response.json()).then(function(data){
    //         for (i in data) {
    //             if ((data[i].Brand === cpuBrand) && !(cpuModelArr.includes(data[i].Model))) {
    //                 cpuModelArr.push(data[i].Model);
    //             };
    //         };
    
    //         let cpuModelSelect = document.getElementById(config.cpuModelSelectId);
    //         cpuModelSelect.innerHTML = "";
    //         cpuModelSelect.insertAdjacentHTML('beforeend', generateOptions(cpuModelArr));
    //     });
    // };


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
// let cpuBrandSelect = document.getElementById(config.cpuBrandSelectId);
// cpuBrandSelect.addEventListener('change', function(e){
//     let cpuBrand = e.target.value;
//     // console.log(cpuBrand);
//     config["cpu"]["brand"] = cpuBrand;
//     generateCPUModelOptions(cpuBrand);
// })

// // CPUモデル選択イベント
// let cpuModelSelect = document.getElementById(config.cpuModelSelectId);
// cpuModelSelect.addEventListener('change', function(e){
//     let cpuModel = e.target.value;
//     // console.log(cpuBrand);
//     config["cpu"]["model"] = cpuModel;
// })

// // GPUブランド選択イベント
// let gpuBrandSelect = document.getElementById(config.gpuBrandSelectId);
// gpuBrandSelect.addEventListener('change', function(e){
//     let gpuBrand = e.target.value;
//     // console.log(gpuBrand);
//     config["gpu"]["brand"] = gpuBrand;
//     generateGPUModelOptions(gpuBrand);
// })

// // GPUモデル選択イベント
// let gpuModelSelect = document.getElementById(config.gpuModelSelectId);
// gpuModelSelect.addEventListener('change', function(e){
//     let gpuModel = e.target.value;
//     // console.log(gpuBrand);
//     config["gpu"]["model"] = gpuModel;
// })

// // RAM個数選択イベント
// let ramNumSelect = document.getElementById(config.ramNumSelectId);
// ramNumSelect.addEventListener('change', function(e){
//     let ramNum = e.target.value;
//     // console.log(ramNum);
//     generateRAMBrandOptions(ramNum);
// })

// // RAMブランド選択イベント
// let ramBrandSelect = document.getElementById(config.ramBrandSelectId);
// ramBrandSelect.addEventListener('change', function(e){
//     let ramBrand = e.target.value;
//     config["ram"]["brand"] = ramBrand;
//     generateRAMModelOptions(ramBrand, ramNumSelect.value);
// })

// // RAMモデル選択イベント
// let ramModelSelect = document.getElementById(config.ramModelSelectId);
// ramModelSelect.addEventListener('change', function(e){
//     let ramModel = e.target.value;
//     config["ram"]["model"] = ramModel;
// })

// // Storageタイプ選択イベント
// let storageTypeSelect = document.getElementById(config.storageTypeSelectId);
// storageTypeSelect.addEventListener('change', function(e){
//     let storageType = e.target.value;
//     // console.log(storageType);
//     config.storageType = storageType;
//     generateStorageCapacityOptions(storageType);
// })

// // Storage Capacity選択イベント
// let storageCapacitySelect = document.getElementById(config.storageCapacitySelectId);
// storageCapacitySelect.addEventListener('change', function(e){
//     let capacity = e.target.value;
//     generateStorageBrandOptions(storageTypeSelect.value, capacity);
// })

// // Storage Brand選択イベント
// let storageBrandSelect = document.getElementById(config.storageBrandSelectId);
// storageBrandSelect.addEventListener('change', function(e){
//     let brand = e.target.value;
//     if (storageTypeSelect.value === "HDD"){
//         config["hdd"]["brand"] = brand;
//     } else {
//         config["ssd"]["brand"] = brand;
//     }
//     generateStorageModelOptions(storageTypeSelect.value, storageCapacitySelect.value, brand);
// })

// // Storage Model選択イベント
// let storageModelSelect = document.getElementById(config.storageModelSelectId);
// storageModelSelect.addEventListener('change', function(e){
//     let model = e.target.value;
//     if (storageTypeSelect.value === "HDD"){
//         config["hdd"]["model"] = model;
//     } else {
//         config["ssd"]["model"] = model;
//     }
// })

// // ボタンが押された時のイベント
// let button = document.getElementById(config.pcPerformanceEvaluateBtnId);
// button.addEventListener("click", function(){
//     if (isAllFormFilledIn()){
//         computePcSpec();
//     }
// })


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

// View.generateSelectPage();

Controller.getComponentData();

setTimeout(function(){
    // let optionArr = [];
    // for (let i in Controller.componentsData["cpu"]){
    //     console.log(Controller.componentsData["cpu"][i].Brand);
    // }

    const view = new View();
    view.generateSelectPage();
},300);


// Controller.getComponentData();






//                     <!-- CPUセクション -->
//                     <h4 class="mt-4">step1: Select Your CPU</h4>
//                     <div class="row">
//                         <div class="div col-3">
//                             <label for="cpuBrandSelect" class="col-1">Brand</label>
//                             <select class="form-control" id="cpuBrandSelect" required>
//                                 <option value="none">-</option>
//                                 <option value="Intel">Intel</option>
//                                 <option value="AMD">AMD</option>
//                             </select>
//                         </div>
//                         <div class="col-3">
//                             <label for="cpuModelSelect" class="col-1">Model</label>
//                             <select class="form-control" id="cpuModelSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                     </div>

//                     <!-- GPUセクション -->
//                     <h4 class="mt-4">step2: Select Your GPU</h4>
//                     <div class="row">
//                         <label for="gpuBrandSelect" class="col-1">Brand</label>
//                         <div class="div col-3">
//                             <select class="form-control" id="gpuBrandSelect" required>
//                                 <option>-</option>
//                                 <option>Nvidia</option>
//                                 <option>AMD</option>
//                                 <option>Zotac</option>
//                                 <option>Asus</option>
//                                 <option>MSI</option>
//                                 <option>Gigabyte</option>
//                                 <option>EVGA</option>
//                                 <option>Sapphire</option>
//                                 <option>PowerColor</option>
//                                 <option>XFX</option>
//                                 <option>ASRock</option>
//                                 <option>Gainward</option>
//                                 <option>PNY</option>
//                                 <option>PwrHis</option>
//                             </select>
//                         </div>
//                         <label for="gpuModelSelect" class="col-1">Model</label>
//                         <div class="col-3">
//                             <select class="form-control" id="gpuModelSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                     </div>

//                     <!-- ramセクション -->
//                     <h4 class="mt-4">step3: Select Your Memory Card</h4>
//                     <div class="row">
//                         <label for="ramNumSelect" class="col-1">How many?</label>
//                         <div class="div col-3">
//                             <select class="form-control" id="ramNumSelect" required>
//                                 <option>-</option>
//                                 <option>1</option>
//                                 <option>2</option>
//                                 <option>3</option>
//                                 <option>4</option>
//                             </select>
//                         </div>
//                         <label for="ramBrandSelect" class="col-1">Brand</label>
//                         <div class="col-3">
//                             <select class="form-control col-12" id="ramBrandSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                         <label for="ramModelSelect" class="col-1">Model</label>
//                         <div class="col-3">
//                             <select class="form-control" id="ramModelSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                     </div>

//                     <!-- storageセクション -->
//                     <h4 class="mt-4">step4: Select Your Storage</h4>
//                     <div class="row">
//                         <label for="storageTypeSelect" class="col-1">HDD or SSD</label>
//                         <div class="div col-2">
//                             <select class="form-control" id="storageTypeSelect" required>
//                                 <option>-</option>
//                                 <option>HDD</option>
//                                 <option>SSD</option>
//                             </select>
//                         </div>
//                         <label for="storageCapacitySelect" class="col-1">Storage</label>
//                         <div class="col-2">
//                             <select class="form-control" id="storageCapacitySelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                         <label for="storageBrandSelect" class="col-1">Brand</label>
//                         <div class="col-2">
//                             <select class="form-control" id="storageBrandSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                         <label for="storageModelSelect" class="col-1">Model</label>
//                         <div class="col-2">
//                             <select class="form-control" id="storageModelSelect" required>
//                                 <option>-</option>
//                             </select>
//                         </div>
//                     </div>
//                     <div class="row">
//                         <button class="btn btn-primary px-5 ml-4 mt-4" id="pc-performance-evaluate-btn" type="button">Add PC</button>
//                     </div>
//             </div>
//             <div class="mt-4" id="pc-spec-result">
            
//             </div>
//   
