require('dotenv').config();

const ApiClient = require('./index');

const apiClient = new ApiClient(
    process.env.ENV,
    process.env.DOMAIN,
    process.env.BA_USER,
    process.env.BA_PASSWORD, {debug: false});

const wait = async time => new Promise(resolve => setTimeout(resolve, time));

async function run() {

    // //REGISTRAZIONE DI UN NUOVO BUSINESS
    //
    // const businessExamplePayload = {
    //     "legalPersonType": "BUSINESS",
    //     "name": "TEST CO.",
    //     "email": "biz" + String(Math.random()) + "@growish.com",
    //     "legalRepresentativeBirthday": "1986/03/19",
    //     "legalRepresentativeLastName": "Lupo",
    //     "legalRepresentativeFirstName": "Domingo",
    //     "headquartersAddress": {
    //         "street": "Via di prova 1",
    //         "city": "Milan",
    //         "region": "MI",
    //         "postalCode": "20200",
    //         "country": "IT"
    //     },
    //     "legalRepresentativeAddress": {
    //         "street": "Via di prova 1",
    //         "city": "Milan",
    //         "region": "MI",
    //         "postalCode": "20200",
    //         "country": "IT"
    //     }
    // };
    //
    // //NB: headquartersAddress e legalRepresentativeAddress sono facoltativi, MA, se viene passato al meno un
    // //sotto campo allora tutto l'oggetto diventa obbligatorio, quindi o lo passi tutto o non passi nulla.
    //
    // const business = await apiClient.Users.create(businessExamplePayload);
    //
    // console.log("Business created!", {id: business.data._id});
    //
    // //CARICAMENTO DEI SUOI DOCUMENTI KYC
    //
    //
    // const kycDoc1 = await apiClient.UserKYC.SendDocumentByLink.create({
    //     "firstPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "secondPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "type": 0,
    //     "user": business.data._id
    // });
    //
    // console.log("KYC DOC 1 CREATED!", {id: kycDoc1.data._id});
    //
    // const kycDoc2 = await apiClient.UserKYC.SendDocumentByLink.create({
    //     "firstPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "secondPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "type": 0,
    //     "user": business.data._id
    // });
    //
    // console.log("KYC DOC 2 CREATED!", {id: kycDoc2.data._id});
    //
    // const kycDoc3 = await apiClient.UserKYC.SendDocumentByLink.create({
    //     "firstPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "secondPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "type": 6,
    //     "user": business.data._id
    // });
    //
    // console.log("KYC DOC 3 CREATED!", {id: kycDoc3.data._id});
    //
    // const kycDoc4 = await apiClient.UserKYC.SendDocumentByLink.create({
    //     "firstPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "secondPage": "https://static.fanpage.it/wp-content/uploads/2018/12/Carta-identit%C3%A0-elettronica-fac-simile-1200x801.jpg",
    //     "type": 11,
    //     "user": business.data._id
    // });
    //
    // console.log("KYC DOC 4 CREATED!", {id: kycDoc4.data._id});
    //
    // //Valori ammessi in Type:
    // //0: IDENTITY PROOF
    // //1: ADDRESS PROOF
    // //6: REGISTRATION PROOF
    // //10: ARTICLES OF ASSOCIATION
    // //11: SHAREHOLDER DECLARATION
    //
    //
    // //Recupera tutti i documenti associati al utente (NON PULLA MANGO)
    // const kycDocuments = await apiClient.UserKYC.Documents
    //     .list([business.data._id]);
    //
    // const kycDocumentId = kycDocuments.data[0]._id;
    //
    // //Recupera un singolo documento del utente (PULLA MANGO)
    // const kycDocument = await apiClient.UserKYC.Document
    //     .read([business.data._id, kycDocumentId]);
    //
    // console.log("KYC DOC READ", {id: kycDocument.data._id, status: kycDocument.data.status});
    // console.log("WAITING FOR WORKER TO SEND IT TO MANGOPAY AND CHECK IF STATUS CHANGE FROM ZERO TO ONE");
    // await wait(5000);
    //
    // const kycDocumentAgain = await apiClient.UserKYC.Document
    //     .read([business.data._id, kycDocumentId]);
    //
    // console.log("KYC DOC READ", {id: kycDocumentAgain.data._id, status: kycDocumentAgain.data.status});
    //
    //
    // //NB 1: Ogni documento caricato richiede in automatico la verifica a Mangopay, se questo
    // //ti da problemi fammi sapere che ti tolgo l'automatismo con un flag e ti do un metodo extra
    // //per richiedere la verifica separatamente
    //
    // //NB 2: Non possono essere caricati nuovi documenti KYC se c'è già uno dello stesso tipo
    // //in attessa di verifica. Questo è valido per tutti i documenti tranne la IDENTITY PROOF
    // //la quale può essere caricata N volte in quanto un bussiness puoi avere piu di una.
    // //Se durante i test ti serve ricaricare un doc N volte non IDENTITY PROOF, rifiutatalo da
    // //dashboard Mango, fai una get del documento da API (per pullarlo) o poi carica di nuovo.
    //
    // //NB 3: La chiamata di caricamento del documento è asincrona e quindi gestita da worker
    // //il che vuol dire che un 200 nella risposta non è necesariamente un caricamento avvenuto
    // //con successo su Mangopay. Quindi se qualcosa non va, verifica il worker di GWV2 (JOB: "process kyc document")
    //
    //
    // const uboDeclaration = await apiClient.UBODeclarations.create([business.data._id], {});
    //
    // console.log("UBO declaration created", { id: uboDeclaration.data._id });
    //
    //
    // const UBO1 = await apiClient.UBO.create([business.data._id, uboDeclaration.data._id], {
    //     "name": "Domingo",
    //     "surname": "Lupo",
    //     "birthplace": {
    //         "country": "VE",
    //         "city": "Test city"
    //     },
    //     "birthday": "1986/03/19",
    //     "address": {
    //         "street": "Via test",
    //         "city": "Test",
    //         "region": "TT",
    //         "postalCode": "12345",
    //         "country": "IT"
    //     },
    //     "nationality": "IT"
    // });
    //
    // console.log("UBO 1 created", { id: UBO1.data._id });
    //
    // const UBO2 = await apiClient.UBO.create([business.data._id, uboDeclaration.data._id], {
    //     "name": "Domingo 2",
    //     "surname": "Lupo 2",
    //     "birthplace": {
    //         "country": "VE",
    //         "city": "Test city"
    //     },
    //     "birthday": "1986/03/19",
    //     "address": {
    //         "street": "Via test",
    //         "city": "Test",
    //         "region": "TT",
    //         "postalCode": "12345",
    //         "country": "IT"
    //     },
    //     "nationality": "IT"
    // });
    //
    // console.log("UBO 2 created", { id: UBO2.data._id });
    //
    // await apiClient.UBO.read([business.data._id, uboDeclaration.data._id, UBO1.data._id]);
    //
    // console.log("UBO 1 read from API ok!");
    //
    // const uboDeclarationFromApi = await apiClient.UBODeclarations.read([business.data._id, uboDeclaration.data._id]);
    //
    // console.log("UBO declaration read from API", { ubos: uboDeclarationFromApi.data.ubos.toString(), status: uboDeclarationFromApi.data.status });
    //
    // await apiClient.SendUBODeclaration.create([business.data._id, uboDeclaration.data._id], {});
    //
    // console.log("UBO declaration sent!");
    //
    // const uboDeclarationFromApiUpdated = await apiClient.UBODeclarations.read([business.data._id, uboDeclaration.data._id]);
    //
    // console.log("UBO declaration new status", { status: uboDeclarationFromApiUpdated.data.status });

    // TEST: PISP ONBOARDING FLOWPAY

    const result = await apiClient.Pisp.onboarding.create(['flowpay'], {
        legalUserId: '615487e47f2c0e3792bac987',
        returnURL: 'https://dev.scuolapay.it'
    }, {forceOnboarding: true});

    console.log('pisp onboard response', result.data.redirectURL);

};

try {
    run();
} catch (e) {
    console.log(e);
}