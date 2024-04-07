import { Layerr } from "layerr";
import { EntryID, EntryType, GroupID, SearchResult, VaultFacade, VaultSourceID } from "buttercup";
import { getLocalValue } from "../storage.js";
import { sendDesktopRequest } from "./request.js";
import { generateAuthHeader } from "./header.js";
import { LocalStorageItem, OTP, VaultSourceDescription, VaultsTree } from "../../types.js";

export async function authenticateBrowserAccess(code: string): Promise<string> {
    const localPublicKey = await getLocalValue(LocalStorageItem.APIPublicKey);
    const clientID = await getLocalValue(LocalStorageItem.APIClientID);
    if (!localPublicKey) {
        throw new Error("No local public key available");
    }
    if (!clientID) {
        throw new Error("No API client ID set");
    }
    const { publicKey } = (await sendDesktopRequest({
        method: "POST",
        route: "/v1/auth/response",
        payload: {
            code,
            id: clientID,
            publicKey: localPublicKey
        }
    })) as { publicKey: string };
    if (!publicKey) {
        throw new Layerr("No server public key received from browser authentication");
    }
    return publicKey;
}

export async function getEntrySearchResults(
    entries: Array<{ entryID: EntryID; sourceID: VaultSourceID }>
): Promise<Array<SearchResult>> {
    const authHeader = await generateAuthHeader();
    const { results } = (await sendDesktopRequest({
        method: "POST",
        route: "/v1/entries/specific",
        auth: authHeader,
        payload: {
            entries
        }
    })) as {
        results: Array<SearchResult>;
    };
    return results;
}

export async function getOTPs(): Promise<Array<OTP>> {
    const authHeader = await generateAuthHeader();
    const { otps } = (await sendDesktopRequest({
        method: "GET",
        route: "/v1/otps",
        auth: authHeader
    })) as {
        otps: Array<OTP>;
    };
    return otps;
}

export async function getVaultSources(): Promise<Array<VaultSourceDescription>> {
    const authHeader = await generateAuthHeader();
    const { sources } = (await sendDesktopRequest({
        method: "GET",
        route: "/v1/vaults",
        auth: authHeader
    })) as {
        sources: Array<VaultSourceDescription>;
    };
    return sources;
}

export async function getVaultsTree(): Promise<VaultsTree> {
    const authHeader = await generateAuthHeader();
    const { names, tree } = (await sendDesktopRequest({
        method: "GET",
        route: "/v1/vaults-tree",
        auth: authHeader
    })) as {
        names?: Record<VaultSourceID, string>;
        tree: Record<VaultSourceID, VaultFacade>;
    };
    return Object.keys(tree).reduce((output, sourceID) => {
        return {
            ...output,
            [sourceID]: {
                ...tree[sourceID],
                name: names?.[sourceID] ?? "Untitled vault"
            }
        };
    }, {});
}

export async function hasConnection(): Promise<boolean> {
    const serverPublicKey = await getLocalValue(LocalStorageItem.APIServerPublicKey);
    return !!serverPublicKey;
}

export async function initiateConnection(): Promise<void> {
    await sendDesktopRequest({
        method: "POST",
        route: "/v1/auth/request",
        payload: {
            client: "browser",
            purpose: "vaults-access",
            rev: 1
        }
    });
}

export async function promptSourceLock(sourceID: VaultSourceID): Promise<boolean> {
    const authHeader = await generateAuthHeader();
    const status = await sendDesktopRequest({
        method: "POST",
        route: `/v1/vaults/${sourceID}/lock`,
        auth: authHeader,
        output: "status"
    });
    return status === 200;
}

export async function promptSourceUnlock(sourceID: VaultSourceID): Promise<void> {
    const authHeader = await generateAuthHeader();
    await sendDesktopRequest({
        method: "POST",
        route: `/v1/vaults/${sourceID}/unlock`,
        auth: authHeader
    });
}

export async function saveExistingEntry(
    sourceID: VaultSourceID,
    groupID: GroupID,
    entryID: EntryID,
    properties: Record<string, string>
): Promise<void> {
    const authHeader = await generateAuthHeader();
    await sendDesktopRequest({
        method: "PATCH",
        route: `/v1/vaults/${sourceID}/group/${groupID}/entry/${entryID}`,
        auth: authHeader,
        payload: {
            properties
        }
    });
}

export async function saveNewEntry(
    sourceID: VaultSourceID,
    groupID: GroupID,
    entryType: EntryType,
    properties: Record<string, string>
): Promise<EntryID> {
    const authHeader = await generateAuthHeader();
    const { entryID } = (await sendDesktopRequest({
        method: "POST",
        route: `/v1/vaults/${sourceID}/group/${groupID}/entry`,
        auth: authHeader,
        payload: {
            properties,
            type: entryType
        }
    })) as {
        entryID: EntryID;
    };
    return entryID;
}

export async function searchEntriesByURL(url: string): Promise<Array<SearchResult>> {
    const authHeader = await generateAuthHeader();
    const { results } = (await sendDesktopRequest({
        method: "GET",
        route: "/v1/entries",
        payload: {
            type: "url",
            url
        },
        auth: authHeader
    })) as {
        results: Array<SearchResult>;
    };
    return results;
}

export async function searchEntriesByTerm(term: string): Promise<Array<SearchResult>> {
    const authHeader = await generateAuthHeader();
    const { results } = (await sendDesktopRequest({
        method: "GET",
        route: "/v1/entries",
        payload: {
            type: "term",
            term
        },
        auth: authHeader
    })) as {
        results: Array<SearchResult>;
    };
    return results;
}

export async function testAuth(): Promise<void> {
    const authHeader = await generateAuthHeader();
    try {
        await sendDesktopRequest({
            method: "POST",
            route: "/v1/auth/test",
            payload: {
                client: "browser",
                purpose: "vaults-access",
                rev: 1
            },
            auth: authHeader
        });
    } catch (err) {
        console.error(err);
        throw new Layerr(err, "Desktop connection failed");
    }
}
