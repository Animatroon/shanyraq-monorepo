import { bindMethods } from "../BindMethonds";
import iconv from "iconv-lite";
import forge from "node-forge";


class Crypt {
    constructor() {
        bindMethods(this)
    }
    private convertUtf8(data: any) {
        try {

            const result = iconv.decode(Buffer.from(data, "binary"), "utf-8");
            return {
                error: false,
                data: result
            };        
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Неизвестная ошибка";
            return {
                error: true,
                message: errorMessage
            };
        }
    }
    private formatName(fullName: string,fatherName: string): { firstName: string; lastName: string, fatherName:string } {
        const words = fullName.split(" "); 
        if (words.length !== 2) throw new Error("Ожидается имя и фамилия");
        const lastName = words[0][0] + words[0].slice(1).toLowerCase(); 
        const firstName = words[1][0] + words[1].slice(1).toLowerCase();
        const newFatherName = fatherName[0] + fatherName.slice(1).toLowerCase();
        return { 
            firstName, 
            lastName,
            fatherName: newFatherName 
        };
    }
    public decodeBuffer(buffer: Buffer ,password: string) {
        try {

            const p12Asn1 = forge.asn1.fromDer(buffer.toString("binary"));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
            
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert;
            if (!cert) {
                return {
                    error: true,
                    message: 'не удалось расшифровать'
                }
            }
            const subject = cert.subject.attributes;
            const iin = subject.find((e) => e.name === "serialNumber")?.value;
            const nameBuffer = subject.find((e) => e.name === "commonName")?.value;
            const givenName = subject.find((e) => e.name === "givenName")?.value;
            if (!nameBuffer) {
                return {
                    error: true,
                    message: 'не удалось расшифровать'
                }
            }
            const fullname = this.convertUtf8(nameBuffer)
            if (fullname.error || !fullname.data) {
                return {
                    error: true,
                    message: fullname.message
                }
            }

            const utf8GivenName = this.convertUtf8(givenName)

            if (utf8GivenName.error || !utf8GivenName.data) {
                return {
                    error: true,
                    message: utf8GivenName.message
                }
            }

            const { firstName, lastName, fatherName } = this.formatName(fullname.data,utf8GivenName.data)
            const finalIin = iin?.toString().replace('IIN','')

            
            return {
                error: false,
                iin: finalIin,
                firstName: firstName,
                lastName: lastName,
                fatherName: fatherName
            }
        }
        catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Неизвестная ошибка";
            return {
                error: true,
                message: errorMessage
            };
        }
    }
}



export default new Crypt()