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

    onSubmitHandler(event) {
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

        var route = this.action
        if (this.method.toUpperCase() === 'GET') {
            const queryParams = new URLSearchParams(jsonData).toString();
            route += '?' + queryParams;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(jsonData);
        }

        fetch(route, options).then(response => {
            const result_text = `[Result(${response.status}): ${response.statusText}] `;
            response.json().then(data => this.showData(response, result_text, data));
        }).catch(error => console.error('Error:', error));
    }

    showData(_, result, data) {
        const scrollTop = this.resultDiv.scrollTop;
        this.resultDiv.textContent = result + JSON.stringify(data);
        this.resultDiv.scrollTop = scrollTop;
    }
}

class FetchTableForm extends FetchForm {
    showData(res, result, data) {
        const scrollTop = this.resultDiv.scrollTop;

        this.resultDiv.textContent = result
        if (res.status == 200) {
            const table = this.createTable(data)
            this.resultDiv.appendChild(table)
        } else {
            this.resultDiv.textContent = result + JSON.stringify(data);
        }

        this.resultDiv.scrollTop = scrollTop;
    }

    createTable(data) {
        // 테이블 생성
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headers = data.columns;
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        thead.appendChild(headerRow);

        // 테이블 바디 생성
        data.rows.forEach(row_data => {
            const row = document.createElement('tr');
            headers.forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = row_data[key];
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }
}

customElements.define('fetch-form', FetchForm, { extends: 'form' });
customElements.define('fetch-table-form', FetchTableForm, { extends: 'form' });