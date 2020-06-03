import { IIconOptions, IIconSubset, registerIcons } from "@uifabric/styling";
// Your use of the content in the files referenced here is subject to the terms of the license at https://aka.ms/fabric-assets-license

// tslint:disable:max-line-length

export function initializeIcons(
	baseUrl: string = "",
	options?: IIconOptions
): void {
	const subset: IIconSubset = {
		style: {
			MozOsxFontSmoothing: "grayscale",
			WebkitFontSmoothing: "antialiased",
			fontStyle: "normal",
			fontWeight: "normal",
			speak: "none"
		},
		fontFace: {
			fontFamily: `"FabricMDL2Icons"`,
			src: `url('${baseUrl}fabric-icons-0e458af4.woff') format('woff')`
		},
		icons: {
			Telemarketer: "\uE7B9",
			Nav2DMapView: "\uE800",
			Headset: "\uE95B",
			Ribbon: "\uE9D1",
			Glasses: "\uEA16",
			Suitcase: "\uEDD3"
		}
	};

	registerIcons(subset, options);
}
