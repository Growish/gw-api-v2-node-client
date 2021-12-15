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

const debug = (message, payload) => {
    if(payload)
        console.log("[GWAPICLIENT - " + new Date().getTime() + " ]: " + message, payload);
    else
        console.log("[GWAPICLIENT - " + new Date().getTime() + " ]: " + message);
}

module.exports = class ApiClient {

    constructor(env, domain, baUser, baPass, options = {}) {

        this.runningRequests = 0;

        this.auth = {
            username: baUser,
            password: baPass
        };

        this.options = {debug: false, ...options};

        this.baseURL = (env.toLowerCase() === 'production' ? baseURLProd : baseURLDev).replace('{{domain}}', domain);


        //API METHODS
        this.Status = (new RestInterface(this, null, '/status')).setPublic({read: true});

        this.Domain = (new RestInterface(this, null, '/'));

        this.Users = (new RestInterface(this, '/users', '/users/{0}', '/users/{0}', '/users'));
        this.UserPersonalWallet = (new RestInterface(this, null, '/users/{0}/get-personal-wallet'));
        this.UserWallets = (new RestInterface(this, null, null,null,'/users/{0}/wallets'));
        this.UsersWalletsContributed = (new RestInterface(this, null, null,null,'/users/{0}/rpc-get-wallets-contributed'));
        this.UserCards = (new RestInterface(this, null, null,null,'/users/{0}/cards'));
        this.UserKYC = {
            //**** Legacy methods
            Send: new RestInterface(this, '/rpc-send-user-identity-proof/{0}'),
            SendByLink: new RestInterface(this, '/rpc-send-user-identity-proof-by-link'),
            Get: new RestInterface(this, null, '/rpc-get-user-identity-proof/{0}'),
            //**** New methods
            SendDocumentByLink: new RestInterface(this, '/rpc-send-kyb-document-by-link'),
            Documents: new RestInterface(this, null, null, null, '/users/{0}/kyc-documents'),
            Document: new RestInterface(this, null, '/users/{0}/kyc-documents/{1}')
        };
        this.UBODeclarations = new RestInterface(this, '/users/{0}/ubo-declarations', '/users/{0}/ubo-declarations/{1}');
        this.UBO = new RestInterface(this, '/users/{0}/ubo-declarations/{1}/ubos', '/users/{0}/ubo-declarations/{1}/ubos/{2}');
        this.SendUBODeclaration = new RestInterface(this, '/users/{0}/ubo-declarations/{1}/rpc-send');

        this.Wallets = (new RestInterface(this, '/wallets', '/wallets/{0}', '/wallets/{0}', '/wallets'));
        this.WalletStatement = (new RestInterface(this, null, '/wallets/{0}/statement'));

        this.Payins = {
            BankWire: new RestInterface(this, '/payins/bankwire'),
            CC: new RestInterface(this, '/payins/cc'),
            CCDirect: new RestInterface(this, '/payins/cc-direct'),
            DirectDebit: new RestInterface(this, '/payins/direct-debit')
        };

        this.Payouts = {
            BankWires: new RestInterface(this, '/payouts/bankwire')
        };

        this.Transactions = new RestInterface(this, null, '/transactions/{0}');

        this.Transfers = new RestInterface(this, '/transfers');

        this.BankAccounts = new RestInterface(this, '/bank-accounts', '/bank-accounts/{0}');

        this.Mandates = new RestInterface(this, '/mandates', '/mandates/{0}', null, null, '/mandates/{0}/revoke');

        this.CardTokenization = new RestInterface(this, '/cards', null, '/cards/{0}');

        this.Tools = {
            CalcTransactionFee: new RestInterface(this, null, '/tools/rpc-calc-transaction-fee')
        }

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
                data: payload ? payload : {},
                timeout: 15000
            };

            if(!isPublic)
                axiosRequestPayload.auth = this.auth;

            if(me.options.debug)
                debug('New API query', { axiosRequestPayload });

            const response = await axios(axiosRequestPayload);

            if(me.options.debug)
                debug('Axios response', { responseData: response.data });

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