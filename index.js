const axios = require('axios');

const RestInterface = require('./rest-interface-class');

const baseURLDev = "https://apidev.growish.com/v2/{{domain}}";
const baseURLProd = "https://api.growish.com/v2/{{domain}}";


class CustomValidationError extends Error {
    constructor(data) {
        super(data);
        this.name = "CustomValidationError";
        this.data = data;
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = "ForbiddenError";
        this.message = message;
    }
}

module.exports = class ApiClient {

    constructor(env, domain, baUser, baPass, options) {

        this.runningRequests = 0;

        this.auth = {
            username: baUser,
            password: baPass
        };

        this.options = options;

        this.baseURL = (env === 'production' ? baseURLProd : baseURLDev).replace('{{domain}}', domain);


        //API METHODS
        this.Status = (new RestInterface(this, null, '/status')).setPublic({read: true});

        this.Domain = (new RestInterface(this, null, '/'));

        this.Users = (new RestInterface(this, '/users', '/users/{0}', '/users/{0}', '/users'));
        this.UserPersonalWallet = (new RestInterface(this, null, '/users/{0}/get-personal-wallet'));
        this.UserWallets = (new RestInterface(this, null, null,null,'/users/{0}/wallets'));
        this.UsersWalletsContributed = (new RestInterface(this, null, null,null,'/users/{0}/rpc-get-wallets-contributed'));
        this.UserCards = (new RestInterface(this, null, null,null,'/users/{0}/cards'));


        this.Wallets = (new RestInterface(this, '/wallets', '/wallets/{0}', '/wallets/{0}', '/wallets'));
        this.WalletStatement = (new RestInterface(this, null, '/wallets/{0}/statement'));

        this.Payins = {
            BankWire: new RestInterface(this, '/payins/bankwire'),
            CC: new RestInterface(this, '/payins/cc'),
            CCDirect: new RestInterface(this, '/payins/cc-direct')
        };

        this.Payouts = {
            BankWires: new RestInterface(this, '/payouts/bankwire')
        };

        this.Transactions = new RestInterface(this, null, '/transactions/{0}');

        this.Transfers = new RestInterface(this, '/transfers');

        this.BankAccounts = new RestInterface(this, '/bank-accounts');

        this.Mandates = new RestInterface(this, '/mandates', '/mandates/{0}');
        this.MandateRevoke = new RestInterface(this, '/mandates/{0}/revoke');

        this.CardTokenization = new RestInterface(this, '/cards', null, '/cards/{0}');


    };


    async makeRequest(endpoint, method, payload, isPublic) {

        const me = this;

        this.runningRequests++;

        try {

            const url = me.baseURL + endpoint;

            const axiosRequestPayload = {
                headers: me._getHeaders(!isPublic),
                url,
                method,
                data: payload,
                timeout: 15000
            };

            if(!isPublic)
                axiosRequestPayload.auth = this.auth;

            const response = await axios(axiosRequestPayload);

            this.runningRequests--;

            if (!response.data || response.data.error)
                return Promise.reject();


            return response.data;
        } catch (error) {

            this.runningRequests--;

            if(!error.response)
                return Promise.reject(error);

            if(error.response.status === 400)
                return Promise.reject(new CustomValidationError(error.response.data.data));

            if(error.response.status === 403)
                return Promise.reject(new ForbiddenError(error.response.data.message));

            if(error.response.status === 404)
                return Promise.resolve(null);


            return Promise.reject(error.response);
        }

    };

    _getHeaders(privateHeaders = false) {

        const headers = {};

        headers['Content-Type'] = 'application/json';

        headers['timestamp'] = (Math.floor(new Date().getTime() / 1000) - 10).toString();

        return headers;

    }

};