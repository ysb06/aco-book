const datetime_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

class FetchForm extends HTMLFormElement {
    constructor() {
        super()
        this.resultDiv = document.createElement('div');
        this.resultDiv.className = 'fetch-result'
        this.resultDiv.textContent = '[No Response]';
        this.appendChild(this.resultDiv);
    }

    connectedCallback() {
        this.addEventListener('submit', this.onSubmitHandler);
    }

    disconnectedCallback() {
        this.removeEventListener('submit', this.onSubmitHandler);
    }

    async onSubmitHandler(event) {
        event.preventDefault();
        this.resultDiv.textContent = "[Sending...]";

        const formData = new FormData(this);
        const jsonData = {};
        formData.forEach((value, key) => {
            if (datetime_regex.test(value)) {
                const date = new Date(value);
                jsonData[key] = date.toJSON();
            } else {
                jsonData[key] = value
            }
        });

        const options = {
            method: this.method,
            headers: {}
        };

        let route = this.action
        if (this.method.toUpperCase() === 'GET') {
            const queryParams = new URLSearchParams(jsonData).toString();
            route += '?' + queryParams;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(jsonData);
        }

        try {
            const response = await fetch(route, options);
            const data = await response.json();

            const scrollTop = this.resultDiv.scrollTop;
            this.showData(response.status, response.statusText, data);
            this.resultDiv.scrollTop = scrollTop;
        } catch (error) {
            console.error('Error:', error);
            this.resultDiv.textContent = `Error: ${error.message}`;
        }
    }

    showData(status, message, data) {
        this.resultDiv.textContent = `[Result(${status}): ${message}] ` + JSON.stringify(data);
    }
}

class DataElement {
    constructor(type) {
        this.element = document.createElement(type)
    }
}

class DataTable extends DataElement {
    constructor(data) {
        super('table')

        this.columns = data.columns
        const thead = document.createElement('thead');
        thead.appendChild(this.generateHeader(this.columns));
        this.element.appendChild(thead);

        this.body = document.createElement('tbody');
        this.rows = data.rows.map(row_data => {
            const row = new DataRow(this.columns, row_data)
            this.body.appendChild(row.element)

            return row
        })
        this.element.appendChild(this.body);
    }

    generateHeader(columns) {
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th'));

        columns.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        return headerRow
    }
}

class DataRow extends DataElement {
    constructor(columns, row_data) {
        super('tr');

        const checkboxCell = document.createElement('td')
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', this.onCheckboxChange.bind(this));

        checkboxCell.appendChild(checkbox)
        this.element.appendChild(checkboxCell)

        this.selected = false;
        this.columns = columns
        this.values = row_data.map(value => {
            const cell = new DataCell(value)
            this.element.appendChild(cell.element)

            return cell
        });
    }

    onCheckboxChange(event) {
        this.selected = event.target.checked
    }
}

class DataCell extends DataElement {
    constructor(value) {
        super('td')

        this.value = value
        this.element.textContent = value
    }
}

class FetchTableForm extends FetchForm {
    constructor() {
        super()
        this.dataTable = null;
    }
    
    showData(status, message, data) {
        if (status == 200) {
            this.dataTable = new DataTable(data);

            this.resultDiv.textContent = `[Result(${status}): ${message}]`;
            this.resultDiv.appendChild(this.dataTable.element);
        } else {
            super.showData(status, message, data)
        }
    }
}

customElements.define('fetch-form', FetchForm, { extends: 'form' });
customElements.define('fetch-table-form', FetchTableForm, { extends: 'form' });