import { ProjectUtils } from "../utilities/project-utils";
import { SelectionOption, WindowUtils } from "../utilities/window-utils";
import * as fs from "fs";
import { FileUtils } from "../utilities/file-utils";
import { SourceFile } from "ts-morph";
import { SourceFileUtils } from "../utilities/source-file-utils";
import { NodeUtils } from "../utilities/node-utils";
import _ from "lodash";
import { CoreUtils } from "../utilities/core-utils";
import readXlsxFile from "read-excel-file";
import { StringUtils } from "../utilities/string-utils";
import { log } from "../utilities/log";
import { UpdatePropertiesResult } from "../interfaces/update-properties-result";
import upath from "upath";
import { WorkspaceUtils } from "../utilities/workspace-utils";

// -----------------------------------------------------------------------------------------
// #region Constants
// -----------------------------------------------------------------------------------------

const CULTURE_FILE_UPDATED = "Successfully updated culture file!";
const ERROR_NO_SUPPORTED_FILES_FOUND = "No .xlsx or .json files were found.";
const ERROR_UPDATING_CULTURE_FILE =
    "There was an error updating the culture file.";

// #endregion Constants

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

const replaceTranslationsFromFile = async () => {
    try {
        const cultureFileOptions = await ProjectUtils.getCultureFileSelectOptions();
        const cultureFile = (
            await WindowUtils.selectionWithValue(cultureFileOptions)
        )?.value;
        if (cultureFile == null) {
            log.debug("No cultureFile entered - not continuing.");
            return;
        }

        const translations = await _getTranslationsFromFile();
        if (translations == null) {
            return;
        }

        const updateResult = await _replaceTranslations(
            translations,
            cultureFile
        );
        if (updateResult == null) {
            WindowUtils.error(ERROR_UPDATING_CULTURE_FILE);
            return;
        }

        log.info(_formatUpdateResult(updateResult));

        const { notFound } = updateResult;
        if (notFound.length > 0) {
            log.warn(`Keys not found: ${notFound.join()}`);
            return await WindowUtils.warning(
                `Found ${notFound.length} keys in JSON file that are not in the source`
            );
        }

        WindowUtils.info(CULTURE_FILE_UPDATED);
    } catch (error) {
        CoreUtils.catch("replaceTranslationsFromFile", error);
    }
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _formatUpdateResult = (result: UpdatePropertiesResult): string =>
    `Updated: ${result.updated.length} Unmodified: ${result.unmodified.length} Not found: ${result.notFound.length}`;

const _getTranslationsFromFile = async (): Promise<
    Record<string, string> | undefined
> => {
    const inputFilePaths = await FileUtils.findAll(["**/*.xlsx", "**/*.json"]);
    if (inputFilePaths.length < 1) {
        WindowUtils.error(ERROR_NO_SUPPORTED_FILES_FOUND);
        return;
    }

    const inputFileOptions: Array<SelectionOption<string>> = inputFilePaths.map(
        (inputFilePath) => ({
            text: upath.relative(WorkspaceUtils.getFolder(), inputFilePath),
            value: inputFilePath,
        })
    );

    const inputFilePath = (
        await WindowUtils.selectionWithValue(inputFileOptions)
    )?.value;

    if (inputFilePath == null) {
        log.debug("No inputFilePath entered - not continuing.");
        return;
    }

    return _parseFile(inputFilePath);
};

const _parseFile = async (
    filePath: string
): Promise<Record<string, string> | undefined> => {
    try {
        const fileContents = fs.readFileSync(filePath);
        const parsedValues: Record<string, string> = StringUtils.isJsonFile(
            filePath
        )
            ? JSON.parse(fileContents.toString())
            : _.fromPairs(await readXlsxFile(fileContents));

        return _sanitizedParsedValues(parsedValues);
    } catch (error) {
        if (error instanceof Error) {
            WindowUtils.error(error.message);
            return;
        }

        WindowUtils.error((error as any).toString());
    }
};

const _replaceTranslations = async (
    translations: Record<string, string>,
    file: SourceFile
): Promise<UpdatePropertiesResult | undefined> => {
    const resourceObject = SourceFileUtils.getResourcesObject(file);
    if (resourceObject == null) {
        WindowUtils.errorResourcesNotFound(file);
        return;
    }

    const existingProperties = NodeUtils.getPropertyAssignments(resourceObject);
    const updatedProperties = NodeUtils.mapToPropertyAssignments(
        translations,
        existingProperties
    );

    const updateResult = NodeUtils.updateProperties(
        existingProperties,
        updatedProperties
    );

    await file.save();

    return updateResult;
};

const _sanitizedParsedValues = (
    object: Record<string, string>
): Record<string, string> => {
    const clonedObject = Object.assign({}, object);
    Object.entries(clonedObject).map(([key, value]) => {
        if (!value.includes('"')) {
            return;
        }

        clonedObject[key] = value.replace(/"/gi, '\\"');
    });

    return clonedObject;
};

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { replaceTranslationsFromFile };

// #endregion Exports
