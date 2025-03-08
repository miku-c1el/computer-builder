import { conf } from "./config.js";
const config = {
    url: conf.apiUrl,
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

    static num = 0;

    createComponents(){
        let isValid = true;

        for (let key in this.components){
            let brand = document.getElementById(key + "BrandSelect").value;
            let model = document.getElementById(key + "ModelSelect").value;
            let ramNum = document.getElementById("ramNumSelect").value;
            let type = document.getElementById("storageTypeSelect").value.toLowerCase();
            let capacity = document.getElementById("storageStorageSelect").value;

            if (!View.isSelected(brand, model, ramNum, type, capacity, key)){
                alert("全ての項目を選択してください");
                isValid = false;
                break;
            } else {
                let benchmark;
                let component;
    
                benchmark = Controller.getBenchmark(key, brand, model, ramNum, type, capacity);
                if (key === "ram"){
                    component = new RAM(brand, model, ramNum, benchmark);
                } else if (key === "storage"){
                    component = new Storage(brand, model, type, capacity, benchmark);
                } else {
                    component = new Component(brand, model, benchmark);
                }

                this.components[key] = component;
                
            }
        }

        if (isValid) {
            Computer.num += 1;
        }
    }

    calculateGamingTotalScore(){
        let gaming = 0;
        // console.log(this.components.cpu.benchmark);
        gaming +=  this.components.cpu.benchmark * 0.25;
        gaming += this.components.gpu.benchmark * 0.6;
        gaming += this.components.ram.benchmark * 0.125;
        gaming += this.components.storage.benchmark * 0.025;
        gaming = Math.floor(gaming);

        return gaming;
    }

    calculateWorkingTotalScore(){
        let working = 0;
        working += this.components.cpu.benchmark * 0.6;
        working += this.components.gpu.benchmark * 0.25;
        working += this.components.ram.benchmark * 0.1;
        working += this.components.storage.benchmark * 0.05;
        working = Math.floor(working);

        return working;
    }
}

class Component{
    brand;
    model;
    benchmark;

    constructor(brand, model, benchmark){
        this.brand = brand;
        this.model = model;
        this.benchmark = benchmark;
    }
}

class RAM extends Component{
    num;
    constructor(brand, model, num, benchmark){
        super(brand, model, benchmark);
        this.num = num;
    }
}

class Storage extends Component{
    type;
    capacity;

    constructor(brand, model, type, capacity, benchmark){
        super(brand, model, benchmark);
        this.type = type;
        this.capacity = capacity;
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

    static getBenchmark(componentName, brand, model, ramNum = null, type = null, capacity = null){
        let componentData;
        if (componentName === "ram"){
            // console.log(ramNum);
            componentData = Controller.componentsData[componentName].filter(component => component["Brand"] === brand && component["Model"] === model && ramNum === Controller.getRamNum(component));

        } else if (componentName === "storage"){
            // console.log(type);
            // console.log(capacity);
            componentData = Controller.componentsData[componentName][type].filter(component => component["Brand"] === brand && component["Model"] === model && component["Type"].toLowerCase() === type && Controller.getStorageCapacity(component) === capacity);

        } else {
            // console.log(Controller.componentsData[componentName]);
            // console.log(brand);
            // console.log(model);
            componentData = Controller.componentsData[componentName].filter(component => component["Brand"] === brand && component["Model"] === model);
        }

        // console.log(componentName);
        // console.log(componentData[0]);
        let benchmark = componentData[0].Benchmark;
        return benchmark;
    }

    // apiを叩いて各部品のデータを取得する
    static async getComponentData() {
        const fetchPromises = [];
    
        for (let component in this.componentsData) {
            if (component === "storage") {
                for (let storageType in this.componentsData["storage"]) {
                    const promise = fetch(config.url + storageType)
                        .then(response => response.json())
                        .then(data => {
                            this.componentsData["storage"][storageType] = data;
                        });
                    fetchPromises.push(promise);
                }
            } else {
                const promise = fetch(config.url + component)
                    .then(response => response.json())
                    .then(data => {
                        this.componentsData[component] = data;
                    });
                fetchPromises.push(promise);
            }
        }
    
        await Promise.all(fetchPromises); // すべての fetch が完了するのを待つ
    }
    

    // メモリの数を格納した配列を取得する
    static getRamNumArr(){
        let ramModelArr = Controller.componentsData["ram"].map(component => component["Model"].split(' '));
        let ramNumArr = ramModelArr.map(ramModel => ramModel[ramModel.length - 1][0]);
        return new Set(ramNumArr);
    }

    // メモリの数を取得する
    static getRamNum(component){
        let ramModel = component["Model"].split(' ');
        let ramNum = ramModel[ramModel.length - 1][0];
        
        return ramNum;
    }


    //ストレージ容量を取得する
    static getStorageCapacity(component){
        let modelArr = Controller.removeParenthesis(component["Model"]).split(' ');
        return modelArr[modelArr.length - 1];
    }

    /**
     * ストレージ関連の関数
     */

    // HDDのモデルに括弧がある場合は取り除く
    static removeParenthesis(model){
        let re = /\s\(.*?\)/;
        if (re.test(model)) {
            model = model.replace(model.match(re)[0], "");
        }
        return model;
    }

    // TBをGBに変換する
    static convertToGB(capacity){
        let tbRe = /TB/;
        let gbRe = /GB/;
        if (tbRe.test(capacity)){
            capacity = parseFloat(capacity.replace("TB", "")) * 1000;
        } else if (gbRe.test(capacity)){
            capacity = parseFloat(capacity.replace("GB", ""));
        }

        return capacity;
    }

    // capacityを文字列に変換し、単位を付与する
    static capacityToString(capacity){
        if ((capacity / 1000) >= 1) {
            return String(capacity / 1000) + "TB";
        } else {
            return String(capacity) + "GB";
        }
    }

    // ストレージ容量の配列を取得する
    static getStorageCapacityArr(type){
            let modelArr = Controller.componentsData["storage"][type].map(component => this.removeParenthesis(component["Model"]).split(' '));

            // 容量を全てGBで統一する
            let capacityArr = modelArr.map(model => Controller.convertToGB(model[model.length - 1]));

            // 降順に並べ替える
            function compareFn(a, b){
                return b - a;
            }
            capacityArr.sort(compareFn);

            // 文字列に変換し直す
            capacityArr = capacityArr.map(capacity => Controller.capacityToString(capacity));

            return new Set(capacityArr);
    }

    // オプション要素に表示させる配列を返す
    static getOptionItems(componentName, label){
        let optionItems;
        if (label === "Num"){
            optionItems = this.getRamNumArr();

        } else if (label === "Type") {
            let ssd = Controller.componentsData[componentName]["ssd"].map(component => component["Type"]);
            let hdd = Controller.componentsData[componentName]["hdd"].map(component => component["Type"]);
            optionItems = ssd.concat(hdd);

        } else if (label === "Storage"){
            optionItems = Controller.getStorageCapacityArr("HDD");

        } else if (label === "Model") {
            if (componentName == "storage") {
                optionItems = Controller.filterByBrandAndStorage(componentName).map(component => component[label]);
            } else if (componentName == "ram") {
                optionItems = Controller.filterByRamNumAndBrand(componentName).map(component => component[label]);
            } else {
                optionItems = Controller.filterByBrand(label, componentName).map(component => component[label]);
            }
        
        } else {
            optionItems = Controller.componentsData[componentName].map(component => component[label]);
        }
        
        return new Set(optionItems);
    }

    // 絶対にtrueになる条件を返す
    // 特定の条件の時だけfilterするとかできるん？
    static filterByBrand(label, componentName){
        let brand;
        let brandSelect = document.getElementById(componentName + "BrandSelect");
        brand = (brandSelect != null) ? brandSelect.value : null;
        let filterdData;
        if (label == "Model" && brandSelect != null) {
                filterdData = this.componentsData[componentName].filter(component => component["Brand"] == brand);

        } else {
            filterdData = this.componentsData[componentName];
        }
        
        return filterdData;
    }

    // storageデータをブランドとstorage容量でfilterをかけた配列を返す
    static filterByBrandAndStorage(componentName){
        let brandSelect = document.getElementById(componentName + "BrandSelect");
        let brand = (brandSelect != "-") ? brandSelect.value : null;

        let type = document.getElementById("storageTypeSelect").value.toLowerCase();
        let storage = document.getElementById("storageStorageSelect").value;
        let filterdData = this.componentsData[componentName][type].filter(component => component["Brand"] == brand && storage == this.getStorageCapacity(component));

        return filterdData;
    }

    static filterByRamNumAndBrand(componentName){
        let brandSelect = document.getElementById(componentName + "BrandSelect");
        let brand = (brandSelect != "-") ? brandSelect.value : null;

        let ramNum = document.getElementById("ramNumSelect").value;
        let filterdData = Controller.componentsData[componentName].filter(component => component["Brand"] === brand && ramNum === Controller.getRamNum(component));

        return filterdData;
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
    static generateDropdownOptions(optionArr) {

        let options = `<option>-</option>`;
    
        for (let item of optionArr) {
            options += `<option value='${item}'>${item}</option>`;
        }

        return options;
    }

    //各コンポーネントの最初のselect要素であるかチェック
    static isFirstSelectElement(component, label) {
        return ((component == "cpu" || component == "gpu") && label == "Brand") || (component === "ram" && label == "Num") || (component === "storage" && label == "Type");
    }

    // select要素を作成
    static generateSelectEle(label, component, isInitialized){
        
        if (label == "HDD or SSD") label = "Type";
        if (label == "How Many") label = "Num";

        let selectEle = document.createElement("select");
        selectEle.classList.add("form-control");
        selectEle.setAttribute("label", label);
        selectEle.setAttribute("component", component);
        selectEle.id = component + label + "Select";

        // オプションを取得して、select要素に追加する
        let optionItems;
        
        // 初回アクセスの時、
        if (isInitialized === false){

            // 最初のselect要素以外はoptionの選択肢を"-”のみにする
            if (!View.isFirstSelectElement(component, label)){
                optionItems = [];
            } else {
                optionItems = Controller.getOptionItems(component, label);
            }

        /* 二回目以降のアクセス */
        } else {
            optionItems = Controller.getOptionItems(component, label);
        }
        
        let dropdownOption = View.generateDropdownOptions(optionItems);
        selectEle.innerHTML = dropdownOption;

        return selectEle;
    }

    // 各部品のselection要素を含んだカードを作成
    generateComponentSelectionCard(componentName){
        // コンポーネント名を作成
        let componentTitle = document.createElement("h5");
        componentTitle.classList.add("mt-4");
        componentTitle.innerHTML = componentName.toUpperCase()

        // form-rowを作成
        let row = document.createElement("div");
        row.classList.add("form-row", "mt-4");
        
        // ラベルごとにselect要素を作成
        let labels = View.componentLabels[componentName];
        for (let label of labels){
            let labelEle = document.createElement("label");
            labelEle.classList.add("mb-2");
            labelEle.innerHTML = label;

            let formGroup = document.createElement("div");
            formGroup.classList.add("form-group", "col-lg-3");

            let selectEle = View.generateSelectEle(label, componentName, this.#isInitialized);
            formGroup.append(labelEle);
            formGroup.append(selectEle);
            row.append(formGroup);

            // イベントリスナーの作成
            selectEle.addEventListener('change', e => {
                let label = selectEle.getAttribute("label");
                if (label === "Brand") {
                    this.displayModelOptions(componentName);

                } else if (label === "Type") {
                    this.displayStorageOptions();
                } else if (label === "Storage"){
                    this.displayStorageBrandOptions();
                } else if (label === "Num") {
                    this.displayRamBrandOptions();
                }
            });
        }

        let target = document.getElementById("target");
        target.append(componentTitle);
        target.append(row);
    }


    
    /**
     *  各componentのラベルごとのオプション表示のための関数
     */

    displayModelOptions(componentName){
        let targetEle = document.getElementById(componentName + "ModelSelect");
        targetEle.innerHTML = "";
        let optionItems = Controller.getOptionItems(componentName, "Model");
        targetEle.insertAdjacentHTML('beforeend', View.generateDropdownOptions(optionItems));
    }

    displayStorageOptions(){
        // storageの種類を取得
        let type = document.getElementById("storageTypeSelect").value.toLowerCase();

        let targetEle = document.getElementById("storageStorageSelect");
        targetEle.innerHTML = "";
        let optionItems = new Set(Controller.getStorageCapacityArr(type));
        targetEle.insertAdjacentHTML('beforeend', View.generateDropdownOptions(optionItems));
    }

    displayStorageBrandOptions(){
        // 選択されたtypeとcapacityを取得する
        let type = document.getElementById("storageTypeSelect").value.toLowerCase();
        let capacity = document.getElementById("storageStorageSelect").value;

        // typeとcapacityが同じブランドの配列を受け取る
        let storageArr = Controller.componentsData["storage"][type].filter(component => Controller.getStorageCapacity(component) === capacity);

        // モデル名のみを含む配列を作成
        let optionItems = new Set(storageArr.map(storage => storage["Brand"]));
        // console.log(optionItems);

        let targetEle = document.getElementById("storageBrandSelect");
        targetEle.innerHTML = "";
        targetEle.insertAdjacentHTML('beforeend',View.generateDropdownOptions(optionItems));
    }

    displayRamBrandOptions(){
        let ramNum = document.getElementById("ramNumSelect").value;

        let ramArr = Controller.componentsData["ram"].filter(component => Controller.getRamNum(component) === ramNum);
        let optionItems = new Set(ramArr.map(ram => ram["Brand"]));

        let targetEle = document.getElementById("ramBrandSelect");
        targetEle.innerHTML = "";
        targetEle.insertAdjacentHTML('beforeend', View.generateDropdownOptions(optionItems));
    }

    generateSelectPage(){
        // 各部品のselect要素を作成
        for (let component in View.componentLabels){
            this.generateComponentSelectionCard(component);
        }

        this.createAddBtn();
        this.#isInitialized = true;
    }

    createAddBtn(){
        let row = document.createElement("div");
        row.classList.add("row",  "justify-content-center", "justify-content-md-start");

        let btn = document.createElement("button");
        btn.classList.add("btn", "btn-primary", "ml-md-3", "mt-md-3", "mt-3", "col-md-2", "col-sm-auto");
        btn.id = "pc-performance-evaluate-btn";
        btn.innerHTML = "Add PC";
        
        let target = document.getElementById("target");
        row.append(btn);

        target.append(row);

        btn.addEventListener('click', e => {
            try {
                let computer = new Computer();
                computer.createComponents();
                // console.log(computer.components);
                let target = document.getElementById("target");
                let card = View.generatePCSpecCard(computer.calculateGamingTotalScore(), computer.calculateWorkingTotalScore(), computer);
                target.insertAdjacentElement('beforeend', card);

            } catch(error) {
                /** エラーをキャッチしたい後の挙動を考える */
                console.log(error);
            }

        })
    }

    //Select要素が選択されているかチェックする
    static isSelected(brand, model, ramNum, type, capacity, componentName){
        if (componentName === "ram"){
            return brand != "-" && model != "-" && ramNum != "-";
        } else if (componentName === "storage"){
            return brand != "-" && model != "-" && type != "-" && capacity != "-";
        } else {
            return brand != "-" && model != "-";
        }
    }

    static generatePCSpecCard(gaming, working, computer){
        let card = document.createElement("div");
        card.classList.add("d-flex", "justify-content-center", "p-5");
        card.id = "card-container";
        let htmlString =
        `
            <div class="col-12 col-lg-8">
                <div class="card">
                    <h3 class="card-header text-center">Your PC ${Computer.num}</h3>
                    <div class="card-body">
                        <div class="row d-flex justify-content-center">
                            <div class="col-8 p-0">
                                <div class="row justify-content-center p-0">
                                    <div class="col-6 d-flex justify-content-center p-0">
                                        <img src="./image/gaming_pc.svg" width="300" class="img-fluid">
                                    </div>
                                    <div class="col-6 d-flex justify-content-center p-0">
                                        <img src="./image/working_pc.svg" width="300" class="img-fluid">
                                    </div>
                                </div>
                            </div>
                            <div class="col-8 p-0">
                                <div class="row">          
                                    <h3 class="col-6 text-center p-0" id="text-percentage">Gaming: ${gaming}%</h3>
                                    <h3 class="col-6 text-center p-0" id="text-percentage">Working: ${working}%</h3>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <table class="table text-center col-12 col-lg-8 mx-auto">
                                <thead>
                                    <tr>
                                        <th scope="col">Parts</th>
                                        <th scope="col">Brand</th>
                                        <th scope="col">Model</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">CPU</th>
                                        <td>${computer.components["cpu"]["brand"]}</td>
                                        <td>${computer.components["cpu"]["model"]}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">GPU</th>
                                        <td>${computer.components["gpu"]["brand"]}</td>
                                        <td>${computer.components["gpu"]["model"]}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Memory</th>
                                        <td>${computer.components["ram"]["brand"]}</td>
                                        <td>${computer.components["ram"]["model"]}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">${computer.components["storage"]["type"].toUpperCase()}</th>
                                        <td>${computer.components["storage"]["brand"]}</td>
                                        <td>${computer.components["storage"]["model"]}</td>
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
}


async function init() {
    await Controller.getComponentData(); // データ取得が完了するまで待つ
    const view = new View();
    view.generateSelectPage();
}

init();
