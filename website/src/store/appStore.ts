import {makeAutoObservable} from 'mobx';



export default class AppStore {
    headerTitle: string = "";
    showToBuyListButton: boolean = true;

    constructor(){
        makeAutoObservable(this)
    }

    setupHeader = (headerTitle: string, showToBuyListButton: boolean = true) => {
        this.headerTitle = headerTitle;
        this.showToBuyListButton = showToBuyListButton;
    }
}