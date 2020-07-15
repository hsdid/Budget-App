class BudgetApp {
    constructor(){
        
        this.switchInput = null;
        this.descriptionInput = null;
        this.valueInput = null;
        this.enterButton = null;
        this.balanceList = null;
        this.balanceListIncones = null;
        this.balanceListExpenses = null;
        this.deleteBtn = null;
        this.totalBudgetInfo = null;
        this.error = null;
        this.currancy = 'PLN';

        this.balaceItems = [];
        
        this.editedItem = null;

        this.totalBudget = 0;

        this.numberOfitems = 0;
        
        this.UiSelector = { 
            switchInput: 'switch',
            descriptionInput: 'description',
            valueInput: 'value',
            enterButton: '[data-enter-button]',
            balanceList: '[data-balance-list]',
            balanceListIncones: '[data-balance-list-incomes]',
            balanceListExpenses: '[data-balance-list-expenses]',
            itemDescription: '[data-item-description]',
            itemvalue: '[data-item-value]',
            totalBudgetInfo: '[data-total-budget]',
            deleteBtn: '[data-delete-btn]',
            editBtn: '[data-edit-btn]',
            error: '[data-error]'
        }
    }
    async initApp(){
        this.descriptionInput = document.getElementById(this.UiSelector.descriptionInput);
        this.valueInput = document.getElementById(this.UiSelector.valueInput);
        this.switchInput = document.getElementById(this.UiSelector.switchInput);
        this.balanceList = document.querySelector(this.UiSelector.balanceList);
        this.enterButton = document.querySelector(this.UiSelector.enterButton);
        this.balanceListIncones = document.querySelector(this.UiSelector.balanceListIncones);
        this.balanceListExpenses = document.querySelector(this.UiSelector.balanceListExpenses);
        this.totalBudgetInfo = document.querySelector(this.UiSelector.totalBudgetInfo);
        this.error = document.querySelector(this.UiSelector.error);

        this.toggleListVisiblity();
        this.updateTotalBudget();
        this.addEventListeners();
    }  
    addEventListeners(){
        this.enterButton.addEventListener('click', ()=>this.addItem());
        this.descriptionInput.addEventListener('blur', ()=> this.hideError());
        this.valueInput.addEventListener('blur', ()=> this.hideError());
        document.addEventListener('keyup', e =>{
            if(e.keyCode === 13){
                this.addItem();
            }
        })
        this.balanceList.addEventListener('click', (e)=> {
            this.listClickHandler(e.target);
        })
    }
    addItem(){
        const newItem = this.getInputValue();
        if(!newItem){
            this.showError();
        }
        
        if(this.editedItem){
            this.updateItem();
            
            return;
        }

        const isNotChecked = !this.switchInput.checked;

        const element = isNotChecked 
        ? this.balanceListIncones 
        : this.balanceListExpenses;

        this.balaceItems.push(newItem);

        element.insertAdjacentHTML('beforeend', this.createItem(newItem.id, newItem.isPlus, newItem.description, newItem.value));
        
        
        this.updateTotalBudget();
        
        this.toggleListVisiblity();
        this.numberOfitems ++;
        this.resetInputValue();
        this.setLocalStorage();
    }

    deleteItem(target){
        const{element, id} = this.getListElement(target);
        const items = [...this.balaceItems];
        this.balaceItems = items.filter(item => item.id !== id);

       
        element.remove()
        this.updateTotalBudget();
        this.toggleListVisiblity();
        this.setLocalStorage();
    }
    editItem(target){
        const{element, id} = this.getListElement(target);
        this.editedItem = element;
        const {description, value, isPlus} = this.balaceItems.find(item => item.id === id,);

        this.descriptionInput.value = description;
        this.valueInput.value = value;
        this.switchInput.checked = !isPlus;
    }

    updateItem(){
        const items = [...this.balaceItems];
        let willBeUpdated = true;
        items.forEach(item => {
            if(item.id === this.editedItem.id ){
                if(item.isPlus === !this.switchInput.checked){
                    item.value = this.valueInput.value;
                    item.description = this.descriptionInput.value
                }else{
                    this.deleteItem(this.editedItem.querySelector(this.UiSelector.deleteBtn),);
                    this.editedItem = null;
                    this.addItem();
                    willBeUpdated = false; 
                }
            }
        })

        if(!willBeUpdated){
            return
        }
        this.balaceItems = items;
        this.editedItem.querySelector(this.UiSelector.itemDescription).textContent = this.descriptionInput.value;
        this.editedItem.querySelector(this.UiSelector.itemvalue).textContent =this.formatPrice(parseFloat(this.valueInput.value,10), !this.switchInput.checked);
        
        this.updateTotalBudget();
        this.resetInputValue();
        this.toggleListVisiblity();
        this.setLocalStorage();
    }

    createItem(id, isPositive, description, price){
        return  `
            <li class="list_item" id="${id}">
                <p class="item_description" data-item-description>${description}</p>
                <p class="item_value ${isPositive ? 'item_value--income' : 'item_value--expnses'}" data-item-value>${this.formatPrice(parseFloat(price,10),isPositive)}</p>     
                <div class="item__buttons">
                    <button class="item_button item_button--edit" data-edit-btn>edit</button>
                    <button class="item_button item_button--delete" data-delete-btn>del</button>
                </div>             
            </li>
        `;
    }
    listClickHandler(target){
        if(target.dataset && target.dataset.editBtn !== undefined){
            this.editItem(target);
        }
        if(target.dataset && target.dataset.deleteBtn !== undefined){
            this.deleteItem(target);
        }
    }
    getListElement(target){
        const listElement = target.parentElement.parentElement;
        const listElementId = listElement.id;
        return {element: listElement, id: listElementId};
    }

    updateTotalBudget(){
        this.totalBudget = 0;
        this.balaceItems.forEach(({isPlus, value}) => {
            isPlus ? (this.totalBudget += parseFloat(value, 10)): (this.totalBudget -= parseFloat(value,10))
        });
        this.totalBudgetInfo.innerHTML = `Your total budget is <span class="${this.totalBudget >= 0 ? 'balance_heading--positive' : 'balance_heading--negative'}">${this.formatPrice(Math.abs(this.totalBudget),this.totalBudget >= 0 ? true : false )} </span>`
    }

    toggleListVisiblity(){
        this.balanceListExpenses.children.length 
        ? this.balanceListExpenses.parentElement.classList.remove('hide')
        : this.balanceListExpenses.parentElement.classList.add('hide');
        this.balanceListIncones.children.length 
        ? this.balanceListIncones.parentElement.classList.remove('hide')
        : this.balanceListIncones.parentElement.classList.add('hide');
    }

    getInputValue(){
        const description = this.descriptionInput.value;
        const value = this.valueInput.value;
        const isPlus = !this.switchInput.checked;
        if(value > 0 && description){
            return{
                id: this.editedItem ? this.editedItem.id :`${this.numberOfitems}`,
                isPlus,
                description,
                value,
                
            }
        }
        else return null;
    }

    resetInputValue(){
        this.descriptionInput.value = '';
        this.valueInput.value = '';
        this.switchInput.checked = true;
    }
    formatPrice(price, isPositive){
        return `${isPositive ? '+' : '-'} ${this.setNumberOfDigits(price, 2)} ${this.currancy}`
    }

    setNumberOfDigits(number , dighits){
        return number.toFixed(dighits)
    }

    setLocalStorage(){
        localStorage.setItem('balaceItems', JSON.stringify(this.balaceItems));
        localStorage.setItem('numberOfItems', JSON.stringify(this.numberOfitems));
    }

    showError(){
        this.error.classList.remove('hide');
    }

    hideError(){
        this.error.classList.add('hide');
    }
}