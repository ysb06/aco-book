const datetime_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

class FetchForm extends HTMLFormElement {
    constructor() {
        super()
        this.resultDiv = document.createElement('div');
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

        fetch(this.action, {
            method: this.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        }).then(response => {
            this.resultDiv.textContent = `[Result(${response.status}): ${response.statusText}] `;
            response.json().then(data => this.showData(data));
        }).catch(error => console.error('Error:', error));
    }

    showData(data) {
        this.resultDiv.textContent += JSON.stringify(data);
    }
}

class FetchTableForm extends FetchForm {
    showData(data) {
        this.resultDiv.textContent = "OK"
    }
}

customElements.define('fetch-form', FetchForm, { extends: 'form' });
customElements.define('fetch-table-form', FetchTableForm, { extends: 'form' });