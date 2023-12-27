class FetchForm extends HTMLFormElement {
    constructor() {
        super()
        this.resultDiv = document.createElement('div')
        this.resultDiv.textContent = '[No Response]';
        this.appendChild(this.resultDiv)
    }

    connectedCallback() {
        this.addEventListener('submit', this.onSubmitHandler)
    }

    disconnectedCallback() {
        this.removeEventListener('submit', this.onSubmitHandler)
    }

    onSubmitHandler(event) {
        event.preventDefault();

        fetch(this.action, { method: this.method, body: new FormData(this) })
            .then(response => {
                this.resultDiv.textContent = `Result(${response.status}): ${response.statusText} `;
                response.json().then(data => {
                    this.resultDiv.textContent += JSON.stringify(data);
                })
            })
            .catch(error => console.error('Error:', error));
    }
}

customElements.define('fetch-form', FetchForm, { extends: 'form' });