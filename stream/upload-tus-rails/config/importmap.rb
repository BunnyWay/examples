pin "application"
pin_all_from "app/javascript/components", under: "components"

# jsDelivr's +esm build bundles tus-js-client's internal modules into one file.
pin "tus-js-client", to: "https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/+esm"
