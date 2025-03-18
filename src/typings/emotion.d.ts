import {themes} from "@themes/ThemeProvider";

import "@emotion/react";

export type ColorType = typeof themes.darkTheme.colors

declare module "@emotion/react" {
    export interface Theme {
        colors: ColorType;
    }
}
