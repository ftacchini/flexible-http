import "reflect-metadata";
import "jasmine";
import { HttpModuleBuilder } from "../../src";
import { testApp } from "./test-http-source"
import * as forge from "node-forge";

const APP_PORT = 8443;

var pki = forge.pki;
var keys = pki.rsa.generateKeyPair(2048);
var cert = pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear()+1);

var attrs = [
    {name:'commonName',value:'example.org'}
   ,{name:'countryName',value:'AR'}
   ,{shortName:'ST',value:'Mendoza'}
   ,{name:'localityName',value:'Chacras de Coria'}
   ,{name:'organizationName',value:'Test'}
   ,{shortName:'OU',value:'Test'}
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

var pem_pkey = pki.privateKeyToPem(keys.privateKey);
var pem_cert = pki.certificateToPem(cert);


testApp("https", APP_PORT, () => {
    return HttpModuleBuilder.instance
        .withPort(APP_PORT)
        .withCredentials({
            key: pem_pkey,
            cert: pem_cert
        })
        .build();
});
