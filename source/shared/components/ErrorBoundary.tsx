import React, { Component } from "react";
import styled from "styled-components";
import { Callout, Intent } from "@blueprintjs/core";
import { t } from "../i18n/trans.js";

const ErrorCallout = styled(Callout)`
    margin: 4px;
    box-sizing: border-box;
    width: calc(100% - 8px) !important;
    height: calc(100% - 8px) !important;
    overflow: scroll;
`;
const PreForm = styled.pre`
    margin: 0px;
`;

function stripBlanks(txt = "") {
    return txt
        .split(/(\r\n|\n)/g)
        .filter(ln => ln.trim().length > 0)
        .join("\n");
}

export class ErrorBoundary extends Component {
    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    state: {
        error: null | Error;
        errorStack: string | null;
    } = {
        error: null,
        errorStack: null
    };

    componentDidCatch(error: Error, errorInfo) {
        this.setState({ errorStack: errorInfo.componentStack || null });
    }

    render() {
        if (!this.state.error) {
            return this.props.children || null;
        }
        return (
            <ErrorCallout intent={Intent.DANGER} icon="heart-broken" title="Error">
                <p>{t("error.fatal-boundary")}</p>
                <code>
                    <PreForm>{this.state.error.toString()}</PreForm>
                </code>
                {this.state.errorStack && (
                    <code>
                        <PreForm>{stripBlanks(this.state.errorStack)}</PreForm>
                    </code>
                )}
            </ErrorCallout>
        );
    }
}
