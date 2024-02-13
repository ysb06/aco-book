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

        const jsonData = {};
        const options = {
            method: this.getAttribute('method'),
            headers: {}
        };
        let route = this.action
        if (!route.endsWith('/')) {
            route += '/';
        }

        new FormData(this).forEach((value, key) => {
            const inputElement = this.querySelector(`[name="${key}"]`);

            if (inputElement.hasAttribute('url-route')) {
                route += value + '/'
            } else if (datetime_regex.test(value)) {
                const date = new Date(value);
                jsonData[key] = date.toJSON();
            } else {
                if (value.length !== 0) {
                    jsonData[key] = value
                }
            }
        });

        if (options.method.toUpperCase() === 'GET') {
            const queryParams = new URLSearchParams(jsonData).toString();
            route += '?' + queryParams;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(jsonData);
        }

        try {
            const response = await fetch(route, options);
            const data = await response.json();
            this.showData(response.status, response.statusText, data);
        } catch (error) {
            console.error(error);
            this.resultDiv.textContent = `Error: ${error.message}`;
        }
    }

    showData(status, message, data) {
        this.resultDiv.textContent = `[Result(${status}): ${message}] ` + JSON.stringify(data);
    }
}

class DataTable {
    constructor(data) {
        this.element = document.createElement('table')

        const thead = document.createElement('thead');
        thead.appendChild(this.generateHeader(data.columns));
        this.element.appendChild(thead);

        this.body = document.createElement('tbody');
        this.rows = data.rows.map(row_data => {
            const row = new DataRow(row_data)
            this.body.appendChild(row.element)

            return row
        })
        this.element.appendChild(this.body);
    }

    generateHeader(columns) {
        const headerRow = document.createElement('tr');
        columns.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        return headerRow
    }
}

class DataRow {
    constructor(row_data) {
        this.element = document.createElement('tr')
        this.values = row_data.map(value => {
            const cell = document.createElement('td')
            cell.textContent = value
            this.element.appendChild(cell)

            return cell
        });
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




function printFormMethodsAndIds() {
    const selector = 'fetch-form, [is="fetch-form"], fetch-table-form, [is="fetch-table-form"]';
    const forms = document.querySelectorAll(selector);

    forms.forEach(form => {
        const id = form.id || 'no id'; // id 속성 값 또는 'no id'
        const tagName = form.tagName.toLowerCase(); // 태그 이름
        const method = form.getAttribute('method') || 'default'; // method 속성 값 또는 기본값
        console.log(`${tagName} (id=${id}): method=${method}`);
    });
}
