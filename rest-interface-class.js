module.exports = class RestInterface {

    constructor(rootContext, createEndpoint, readEndpoint, editEndpoint, listEndpoint, deleteEndpoint) {

        this.rootContext = rootContext;

        this.isPublic = { create: false, read: false, edit: false, list: false, delete: false };

        this.createEndpoint = createEndpoint;
        this.readEndpoint = readEndpoint;
        this.editEndpoint = editEndpoint;
        this.listEndpoint = listEndpoint;
    }

    setPublic(options) {
        this.isPublic = {...this.isPublic, options};
        return this;
    }


    async create(payload = {}) {
        return await this.rootContext.makeRequest(this.createEndpoint, 'POST', payload, this.isPublic.create);
    }

    async read(urlParams = [], queryParams = null) {
        return await this.rootContext.makeRequest(prepareURL(this.readEndpoint, urlParams, queryParams), 'GET', null, this.isPublic.read);
    }

    async list(urlParams = [], queryParams = null) {
        return await this.rootContext.makeRequest(prepareURL(this.listEndpoint, urlParams, queryParams), 'GET', null, this.isPublic.list);
    }

    async update(urlParams = [], payload = {}) {
        return await this.rootContext.makeRequest(prepareURL(this.editEndpoint || this.readEndpoint, urlParams), 'PUT', payload, this.isPublic.update);
    }

    async delete(urlParams) {
        return await this.rootContext.makeRequest(prepareURL(this.createEndpoint, urlParams), 'DELETE', null, this.isPublic.delete);
    }
};

const prepareURL = (url, _urlParams, _queryParams) => {

    let params;
    if(typeof _urlParams === 'string')
        params = [_urlParams];
    else
        params = _urlParams;

    let res = url.replace(/{(\d+)}/g, function (match, number) {
        return typeof params[number] !== 'undefined'
            ? params[number]
            : match
            ;
    });

    if(_queryParams)
        res += '?' + serialize(_queryParams);

    return res;

};

const serialize = (obj) => {
    const str = [];

    for (let p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }

    return str.join("&");
}