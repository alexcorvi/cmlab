import { dbAction, files, localDBRefs } from "@core";
import { registerModules } from "@modules";
import * as modules from "@modules";
import {
	checkClient,
	checkServer,
	day,
	num,
	second,
	store
	} from "@utils";
import { computed, observable } from "mobx";
import { Md5 } from "ts-md5";

const demoHosts: string[] = ["demo.apexo.app"];

export enum LoginStep {
	loadingData,
	allDone,
	initial
}

export enum LoginType {
	initialActiveSession = "initial-active-session",
	initialLSLHashTS = "initial-lsl-hash-ts",
	loginCredentialsOnline = "login-credentials-online",
	loginCredentialsOffline = "login-credentials-offline",
	cypress = "no-server"
}

export class Status {
	private currentlyValidating: string | null = null;
	@observable dbActionProgress: string[] = [];
	@observable loadingIndicatorText = "";
	@observable initialLoadingIndicatorText = "";
	@observable server: string = "";
	@observable invalidLogin: boolean = false;

	@observable keepServerOffline = false;

	@observable step: LoginStep = LoginStep.initial;

	@observable isOnline = {
		dropbox: false,
		server: false,
		client: false
	};

	@observable tryOffline: boolean = false;

	@observable loginType: LoginType | "" = "";

	constructor() {
		this.validateOnlineStatus().then(() => {
			setInterval(() => this.validateOnlineStatus(), second * 2);
		});
	}

	async initialCheck(server: string) {
		this.initialLoadingIndicatorText = "checking online status";
		this.server = server;
		await this.validateOnlineStatus();

		this.initialLoadingIndicatorText = "checking active session";
		if (this.isOnline.server) {
			if (await this.activeSession(this.server)) {
				this.loginType = LoginType.initialActiveSession;
				await this.start({ server });
				store.set("LSL_TS", new Date().getTime().toString());
				return;
			}
		} else if (store.found("LSL_hash")) {
			const now = new Date().getTime();
			const then = new Date(num(store.get("LSL_TS"))).getTime();
			if (now - then < 7 * day) {
				this.loginType = LoginType.initialLSLHashTS;
				this.start({ server });
			}
		}
	}

	async loginWithCredentials({
		username,
		password,
		server
	}: {
		username: string;
		password: string;
		server: string;
	}) {
		this.server = server;
		await this.validateOnlineStatus();
		if (!this.isOnline.server && store.found("LSL_hash")) {
			return this.loginWithCredentialsOffline({
				username,
				password,
				server
			});
		}

		if (this.isOnline.server) {
			return this.loginWithCredentialsOnline({
				username,
				password,
				server
			});
		} else {
			if (store.found("LSL_hash")) {
				this.tryOffline = true;
			}
			return `
				An error occurred, please make sure that the server is online and it\'s accessible.
				Click "change" to change into another server
			`;
		}
	}

	async loginWithCredentialsOnline({
		username,
		password,
		server,
		noStart
	}: {
		username: string;
		password: string;
		server: string;
		noStart?: boolean;
	}) {
		const PouchDB: PouchDB.Static =
			((await import("pouchdb-browser")) as any).default ||
			((await import("pouchdb-browser")) as any);
		const auth: PouchDB.Plugin =
			((await import("pouchdb-authentication")) as any).default ||
			((await import("pouchdb-authentication")) as any);
		PouchDB.plugin(auth);
		try {
			await new PouchDB(server, { skip_setup: true }).logIn(
				username,
				password
			);
			if (noStart) {
				return true;
			}
			store.set(
				"LSL_hash",
				Md5.hashStr(server + username + password).toString()
			);
			store.set("LSL_TS", new Date().getTime().toString());
			this.loginType = LoginType.loginCredentialsOnline;
			this.start({ server });
			return true;
		} catch (e) {
			console.error(e);
			return (e.reason as string) || "Could not login";
		}
	}

	async loginWithCredentialsOffline({
		username,
		password,
		server,
		noStart
	}: {
		username: string;
		password: string;
		server: string;
		noStart?: boolean;
	}) {
		const LSL_hash = store.get("LSL_hash");
		if (LSL_hash === Md5.hashStr(server + username + password).toString()) {
			if (noStart) {
				return true;
			} else {
				this.loginType = LoginType.loginCredentialsOffline;
				this.start({ server });
				return true;
			}
		} else {
			return "This was not the last username/password combination you used!";
		}
	}

	async startNoServer() {
		this.keepServerOffline = true;
		this.loginType = LoginType.cypress;
		await this.start({
			server: "http://cypress"
		});
	}

	async start({ server }: { server: string }) {
		console.log("Login Type:", this.loginType);
		this.server = server;
		store.set("server_location", server);
		this.step = LoginStep.loadingData;
		try {
			this.loadingIndicatorText = "Registering modules";
			await registerModules();
			this.step = LoginStep.allDone;
		} catch (e) {
			console.log("Registering modules failed", e);
			console.log("possible DB corruption, deleting local databases");
			for (let i = 0; i < localDBRefs.length; i++) {
				await localDBRefs[i].destroy({});
			}
		}
	}

	async removeCookies() {
		const PouchDB: PouchDB.Static =
			((await import("pouchdb-browser")) as any).default ||
			((await import("pouchdb-browser")) as any);
		const auth: PouchDB.Plugin =
			((await import("pouchdb-authentication")) as any).default ||
			((await import("pouchdb-authentication")) as any);
		return await new PouchDB(this.server, { skip_setup: true }).logOut();
	}

	async logout() {
		if (this.isOnline.server && !this.keepServerOffline) {
			try {
				this.removeCookies();
				await dbAction("logout");
			} catch (e) {
				console.log("Failed to logout", e);
			}
		}
		store.clear();
		location.reload();
	}

	async activeSession(server: string) {
		const PouchDB: PouchDB.Static = ((await import(
			"pouchdb-browser"
		)) as any).default;
		const auth: PouchDB.Plugin = ((await import(
			"pouchdb-authentication"
		)) as any).default;
		PouchDB.plugin(auth);
		try {
			if (this.isOnline.server && !this.keepServerOffline) {
				return !!(
					await new PouchDB(server, {
						skip_setup: true
					}).getSession()
				).userCtx.name;
			}
		} catch (e) {}
		return false;
	}

	async validateOnlineStatus() {
		if (this.currentlyValidating === this.server) {
			return;
		} else {
			this.currentlyValidating = this.server;
		}

		try {
			if (this.keepServerOffline) {
				this.isOnline.server = false;
			} else {
				this.initialLoadingIndicatorText =
					"checking server connectivity";
				const serverConnectivityResult = await checkServer(this.server);
				if (!this.isOnline.server && !!serverConnectivityResult) {
					// we were offline, and we're now online
					// resync on online status change
					dbAction("resync");
				}
				this.isOnline.server = !!serverConnectivityResult;
				if (
					serverConnectivityResult &&
					!serverConnectivityResult.name
				) {
					// when server is online but user is invalid
					this.invalidLogin = true;
				} else if (
					serverConnectivityResult &&
					serverConnectivityResult.name
				) {
					this.invalidLogin = false;
				}
			}
			this.initialLoadingIndicatorText = "checking client connectivity";
			this.isOnline.client = await checkClient();
			this.initialLoadingIndicatorText =
				"checking files server connectivity";
			if (modules.setting) {
				this.isOnline.dropbox = await files.status();
			}
		} catch (e) {}
		this.currentlyValidating = null;
	}
	reset() {
		this.server = "";
		this.keepServerOffline = false;
		this.step = LoginStep.initial;
		this.isOnline = {
			server: false,
			client: false,
			dropbox: false
		};
		this.tryOffline = false;
		this.loginType = "";
	}
}

export const status = new Status();
