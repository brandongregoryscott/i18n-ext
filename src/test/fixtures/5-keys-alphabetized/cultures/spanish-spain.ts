import {
    BaseSpanishSpain,
    Culture,
    LocalizationUtils,
    // @ts-ignore
} from "andculturecode-javascript-core";
import { CultureResources } from "../interfaces/culture-resources";

const SpanishSpain: Culture<CultureResources> = LocalizationUtils.cultureFactory(
    BaseSpanishSpain,
    {
        resources: {
            accountInformation: "(Updated) Información de la cuenta",
            cancelMySubscription: "(Updated) Cancelar mi suscripción",
            checkOutFaq: "(Updated) Echa un vistazo a nuestras preguntas frecuentes",
            subscriptionDetails: "Detalles de suscripción",
            teamManagement: "Gestión de equipos"
        },
    }
);

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { SpanishSpain };

// #endregion Exports
