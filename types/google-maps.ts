declare module "@react-google-maps/api" {
  export interface LoadScriptProps {
    libraries?: (
      | "places"
      | "drawing"
      | "geometry"
      | "localContext"
      | "visualization"
    )[];
  }
}
