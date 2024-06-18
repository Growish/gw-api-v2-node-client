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

        this.options = {
            debug: false,
            fullResponse: true,
            includePaymentInstitutionId: false,
            baseURL: (env.toLowerCase() === 'production' ? baseURLProd : baseURLDev).replace('{{domain}}', domain),
            ...options};


        //API METHODS
        this.Status = (new RestInterface(this, null, '/status')).setPublic({read: true});

        this.Domain = (new RestInterface(this, null, '/'));

        this.Users = (new RestInterface(this, '/users', '/users/{0}', '/users/{0}', '/users'));
        this.UsersByEmail = new RestInterface(this, null, '/rpc-get-user-by-email');
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
        this.UserLiveness = {
            start: new RestInterface(this, '/rpc-start-liveness/{0}'),
            document: new RestInterface(this, null, '/rpc-get-liveness-document/{0}')
        };
        this.UserState = {
            lock: new RestInterface(this, '/users/{0}/lock'),
            suspend: new RestInterface(this, '/users/{0}/suspend')
        }
        this.Pisp = {
            onboarding: new RestInterface(this, '/pisp/onboarding/{0}'),
            checkout: new RestInterface(this, '/pisp/checkout/{0}','/pisp/transactions/{0}/legalUser/{1}/checkout/{2}'),
            pagopa: new RestInterface(this, '/pisp/checkout/pagopa/flowpay'),
            receipt: new RestInterface(this, '/pisp/transactions/receipt/flowpay')
        }
        this.UBODeclarations = new RestInterface(this, '/users/{0}/ubo-declarations', '/users/{0}/ubo-declarations/{1}', null, '/users/{0}/ubo-declarations');
        this.UBO = new RestInterface(this, '/users/{0}/ubo-declarations/{1}/ubos', '/users/{0}/ubo-declarations/{1}/ubos/{2}');
        this.SendUBODeclaration = new RestInterface(this, '/users/{0}/ubo-declarations/{1}/rpc-send');

        this.Wallets = (new RestInterface(this, '/wallets', '/wallets/{0}', '/wallets/{0}', '/wallets'));
        this.WalletVirtualIban = new RestInterface(this, '/wallets/{0}/rpc-create-virtual-iban');
        this.WalletStatement = (new RestInterface(this, null, '/wallets/{0}/statement'));

        this.Payins = {
            BankWire: new RestInterface(this, '/payins/bankwire'),
            CC: new RestInterface(this, '/payins/cc'),
            CCDirect: new RestInterface(this, '/payins/cc-direct'),
            DirectDebit: new RestInterface(this, '/payins/direct-debit'),
            Generic: new RestInterface(this, '/payins/generic')
        };

        this.Payouts = {
            BankWires: new RestInterface(this, '/payouts/bankwire'),
            Generic: new RestInterface(this, '/payouts/generic')
        };

        this.Transactions = new RestInterface(this, null, '/transactions/{0}');

        this.Refunds = new RestInterface(this, '/transactions/{0}/refund');

        this.Transfers = new RestInterface(this, '/transfers');

        this.BankAccounts = new RestInterface(this, '/bank-accounts', '/bank-accounts/{0}');

        this.Mandates = new RestInterface(this, '/mandates', '/mandates/{0}', null, null, '/mandates/{0}/revoke');

        this.CardTokenization = new RestInterface(this, '/cards', null, '/cards/{0}', null, '/cards/{0}/deactivate');

        this.GeneratedCards = new RestInterface(this, '/generated-cards', '/generated-cards/{0}');
        this.GeneratedCardImage = new RestInterface(this, null, '/generated-cards/{0}/image');
        this.GeneratedCardOptions = new RestInterface(this, null, null, '/generated-cards/{0}/options');
        this.GeneratedCardLock = new RestInterface(this, '/generated-cards/{0}/lock');
        this.GeneratedCardLimits = new RestInterface(this, null, null, '/generated-cards/{0}/limits');
        this.GeneratedCardConvert = new RestInterface(this, null, null, '/generated-cards/{0}/convert');
        this.GeneratedCardActivate = new RestInterface(this, null, null, '/generated-cards/{0}/activate');
        this.GeneratedPhysicalCards = new RestInterface(this, '/generated-physical-card');
        this.GeneratedCardChangePin = new RestInterface(this, null, null, '/generated-cards/{0}/change-pin');
        this.GeneratedCardUnblockPin = new RestInterface(this, null, null, '/generated-cards/{0}/unblock-pin');

        this.Tools = {
            CalcTransactionFee: new RestInterface(this, null, '/tools/rpc-calc-transaction-fee'),
            ShorUrl: new RestInterface(this, "/tools/rpc-short-url"),
            SimulateTreezorPayin: new RestInterface(this, '/tools/simulate-treezor-payin')
        };

        this.Cards = {
            HostedSaveCards: new RestInterface(this, '/cards/hosted-save-cards')
        };

        this.TaxResidence = new RestInterface(this, '/users/me/tax-residence');

        this.ScaWallets = new RestInterface(this, '/sca/sca-wallets/save', null, null, null, '/sca/sca-wallets/delete/{0}');
        this.ScaOauthToken = new RestInterface(this, '/sca/oauth/token');
        this.ScaPin = new RestInterface(this, null, null, '/sca/sca-wallets/reset-pin/{0}'); 

    };


    async makeRequest(endpoint, method, payload, isPublic, forceFullResponse) {

        const me = this;

        this.runningRequests++;

        try {

            const url = me.options.baseURL + endpoint;

            const axiosRequestPayload = {
                headers: me._getHeaders(!isPublic, me.options.includePaymentInstitutionId),
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


            return me.options.fullResponse || forceFullResponse ? response.data : response.data.data;

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

    _getHeaders(privateHeaders = false, includePaymentInstitutionId = false) {

        const headers = {};

        headers['Content-Type'] = 'application/json';

        headers['timestamp'] = (Math.floor(new Date().getTime() / 1000) - 10).toString();

        if (includePaymentInstitutionId) {
            headers['x-include-payment-institution-id'] = true;
        }

        return headers;

    }

};
