import * as fs from "fs";
import * as os from "os";
import * as path from "path";


export interface AwsProfile {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
}

export function readAwsProfile(profile = "default"): AwsProfile {
    const credsPath =
        process.env.AWS_SHARED_CREDENTIALS_FILE ||
        path.join(os.homedir(), ".aws", "credentials");

    let kv: Record<string, string> = {};
    if (fs.existsSync(credsPath)) {
        kv = parseIniSection(fs.readFileSync(credsPath, "utf-8"), profile);
    }

    const accessKeyId =
        kv["aws_access_key_id"] || process.env.AWS_ACCESS_KEY_ID || "";
    const secretAccessKey =
        kv["aws_secret_access_key"] || process.env.AWS_SECRET_ACCESS_KEY || "";
    const sessionToken =
        kv["aws_session_token"] || process.env.AWS_SESSION_TOKEN || undefined;

    if (!accessKeyId || !secretAccessKey) {
        throw new Error(
            `No se encontraron credenciales AWS validas para el perfil [${profile}]. ` +
            `Verifica ${credsPath} o las variables de entorno AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.`
        );
    }

    return { accessKeyId, secretAccessKey, sessionToken };
}


function parseIniSection(content: string, sectionName: string): Record<string, string> {
    const result: Record<string, string> = {};
    let inSection = false;
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#") || line.startsWith(";")) continue;

        if (line.startsWith("[") && line.endsWith("]")) {
            const name = line.slice(1, -1).trim();
            inSection = name === sectionName;
            continue;
        }
        if (!inSection) continue;

        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim().toLowerCase();
        const val = line.slice(eq + 1).trim();
        result[key] = val;
    }
    return result;
}
