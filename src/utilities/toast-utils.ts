import * as vscode from "vscode";

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const error = (value: string | object) =>
    _showToast(value, vscode.window.showErrorMessage);

const info = (value: string | object) =>
    _showToast(value, vscode.window.showInformationMessage);

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _showToast = (
    value: string | object,
    fn: (message: string, ...items: string[]) => Thenable<string | undefined>
) => {
    if (typeof value !== "string") {
        value = JSON.stringify(value);
    }

    return fn(value);
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export const ToastUtils = {
    error,
    info,
};

// #endregion Exports
