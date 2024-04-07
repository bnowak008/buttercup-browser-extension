import React, { useCallback, useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { Button, InputGroup, Intent, NonIdealState, Spinner } from "@blueprintjs/core";
import { SearchResult, VaultSourceStatus } from "buttercup";
import { t } from "../../../shared/i18n/trans.js";
import { useDesktopConnectionState, useEntriesForURL, useRecentEntries, useSearchedEntries, useVaultSources } from "../../hooks/desktop.js";
import { EntryItemList } from "../entries/EntryItemList.js";
import { LaunchContext } from "../contexts/LaunchContext.js";
import { sendEntryResultToTabForInput } from "../../services/tab.js";
import { trackEntryRecentUse } from "../../services/recents.js";
import { getToaster } from "../../../shared/services/notifications.js";
import { localisedErrorMessage } from "../../../shared/library/error.js";
import { DesktopConnectionState } from "../../types.js";
import { openPageForEntry } from "../../services/entry.js";
import { EntryInfoDialog } from "../entries/EntryInfoDialog.js";

interface EntriesPageProps {
    onConnectClick: () => Promise<void>;
    onReconnectClick: () => Promise<void>;
    searchTerm: string;
}

interface EntriesPageControlsProps {
    onSearchTermChange: (term: string) => void;
    searchTerm: string;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
`;
const Input = styled(InputGroup)`
    margin-right: 2px !important;
`;
const InvalidState = styled(NonIdealState)`
    margin-top: 28px;
`;

export function EntriesPage(props: EntriesPageProps) {
    const desktopState = useDesktopConnectionState();
    return (
        <Container>
            {desktopState === DesktopConnectionState.NotConnected && (
                <InvalidState
                    title={t("popup.vaults.no-connection.title")}
                    description={t("popup.vaults.no-connection.description")}
                    icon="offline"
                    action={(
                        <Button
                            icon="link"
                            onClick={props.onConnectClick}
                            text={t("popup.vaults.no-connection.action-text")}
                        />
                    )}
                />
            )}
            {desktopState === DesktopConnectionState.Connected && (
                <EntriesPageList {...props} />
            )}
            {desktopState === DesktopConnectionState.Pending && (
                <Spinner size={40} />
            )}
            {desktopState === DesktopConnectionState.Error && (
                <InvalidState
                    title={t("popup.connection.check-error.title")}
                    description={t("popup.connection.check-error.description")}
                    icon="error"
                    intent={Intent.DANGER}
                    action={(
                        <Button
                            icon="link"
                            onClick={props.onReconnectClick}
                            text={t("popup.vaults.no-connection.action-text")}
                        />
                    )}
                />
            )}
        </Container>
    );
}

function EntriesPageList(props: EntriesPageProps) {
    const sources = useVaultSources();
    const unlockedCount = useMemo(
        () => sources.reduce(
            (count, source) => source.state === VaultSourceStatus.Unlocked ? count + 1 : count,
            0
        ),
        [sources]
    );
    const searchedEntries = useSearchedEntries(props.searchTerm);
    const { formID, source: popupSource, url } = useContext(LaunchContext);
    const [selectedEntryInfo, setSelectedEntryInfo] = useState<SearchResult | null>(null);
    const urlEntries = useEntriesForURL(url);
    const recentEntries = useRecentEntries();
    const handleEntryClick = useCallback((entry: SearchResult, autoLogin: boolean) => {
        if (popupSource === "page" && formID) {
            sendEntryResultToTabForInput(formID, entry);
        } else if (popupSource === "popup") {
            openPageForEntry(entry, autoLogin)
                .then(opened => {
                    if (!opened) {
                        getToaster().show({
                            intent: Intent.PRIMARY,
                            message: t("popup.entries.click.no-url-available"),
                            timeout: 3000
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    getToaster().show({
                        intent: Intent.DANGER,
                        message: t("popup.entries.click.open-error", { message: localisedErrorMessage(err) }),
                        timeout: 10000
                    });
                });
        }
        trackEntryRecentUse(entry).catch(err => {
            console.error(err);
            getToaster().show({
                intent: Intent.DANGER,
                message: t("popup.entries.click.recent-set-error", { message: localisedErrorMessage(err) }),
                timeout: 10000
            });
        });
    }, [popupSource]);
    const handleEntryAutoLoginClick = useCallback((entry: SearchResult) => {
        handleEntryClick(entry, true);
    }, [handleEntryClick]);
    const handleEntryBodyClick = useCallback((entry: SearchResult) => {
        handleEntryClick(entry, false);
    }, [handleEntryClick]);
    const handleEntryInfoClick = useCallback((entry: SearchResult) => {
        setSelectedEntryInfo(entry);
    }, []);
    // Render
    return (
        <>
            {unlockedCount === 0 && (
                <InvalidState
                    title={t("popup.all-locked.title")}
                    description={t("popup.all-locked.description")}
                    icon="folder-close"
                />
            ) || searchedEntries.length > 0 && (
                <EntryItemList
                    entries={searchedEntries}
                    onEntryAutoClick={handleEntryAutoLoginClick}
                    onEntryClick={handleEntryBodyClick}
                    onEntryInfoClick={handleEntryInfoClick}
                />
            ) || (urlEntries.length <= 0 && recentEntries.length <= 0) && (
                <InvalidState
                    title={t("popup.no-entries.title")}
                    description={t("popup.no-entries.description")}
                    icon="clean"
                />
            ) || (
                <EntryItemList
                    entries={{
                        "URL Entries": urlEntries,
                        "Recents": recentEntries
                    }}
                    onEntryAutoClick={handleEntryAutoLoginClick}
                    onEntryClick={handleEntryBodyClick}
                    onEntryInfoClick={handleEntryInfoClick}
                />
            )}
            <EntryInfoDialog entry={selectedEntryInfo} onClose={() => setSelectedEntryInfo(null)} />
        </>
    );
}

export function EntriesPageControls(props: EntriesPageControlsProps) {
    const desktopState = useDesktopConnectionState();
    return (
        <>
            <Input
                disabled={desktopState !== DesktopConnectionState.Connected}
                onChange={evt => props.onSearchTermChange(evt.target.value)}
                placeholder={t("popup.entries.search.placeholder")}
                round
                value={props.searchTerm}
            />
            <Button
                disabled={desktopState !== DesktopConnectionState.Connected}
                icon="search"
                minimal
                title={t("popup.entries.search.button")}
            />
        </>
    );
}
