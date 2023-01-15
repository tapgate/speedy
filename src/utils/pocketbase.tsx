import PocketBase from "pocketbase";

export interface PocketbaseErrorData {
  [key: string]: PocketBaseErrorInfo;
}

export interface PocketBaseErrorInfo {
  code: string;
  message: string;
}

const pocketbase = new PocketBase(process.env.REACT_APP_POCKETBASE_URL);

class PocketbaseSingleton {
  private static instance: PocketbaseSingleton;
  public pocketbase: PocketBase;
  private adminAuth: any;

  private constructor() {
    this.pocketbase = new PocketBase(process.env.REACT_APP_POCKETBASE_URL);
    this.adminAuth = localStorage.getItem("pocketbase_auth")
  }

  public static getInstance(): PocketbaseSingleton {
    if (!PocketbaseSingleton.instance) {
      PocketbaseSingleton.instance = new PocketbaseSingleton();
    }
    return PocketbaseSingleton.instance;
  }

private async loginAdmin(): Promise<PocketBase> {
    try {
      this.adminAuth = await this.pocketbase.admins.authWithPassword(
        `${process.env.REACT_APP_POCKETBASE_ADMIN_USERNAME}`,
        `${process.env.REACT_APP_POCKETBASE_ADMIN_PASSWORD}`,
        { $autoCancel: false }
      );
      console.log({ adminAuth: this.adminAuth });
      return this.pocketbase;
    } catch (error) {
      console.log("error in admin pocketbase token", error);
      throw new Error("Error connecting to Pocketbase");
    }
  }

  public async connection(): Promise<PocketBase> {
    return new Promise(async (resolve, reject) => {
        try {
            if (process.env.REACT_APP_CLIENT === "server") {
              if (!this.adminAuth) {
                  console.log("login admin pocketbase token");
                  await this.loginAdmin();
              } else {
                try {
                  console.log("refresh admin pocketbase token");
                  this.adminAuth = await this.pocketbase.admins.authRefresh({ $autoCancel: false });
                  console.log({ adminAuth: this.adminAuth });
                } catch (error) {
                  await this.loginAdmin();
                }
              }
              console.log("logged in admin pocketbase token");
              resolve(this.pocketbase)
            } else {
              resolve(this.pocketbase)
            }
          } catch (error) {
            console.log("error in admin pocketbase token", error);
            reject("Error connecting to Pocketbase");
          }
    });
  }
}

let pocketbaseAdmin = PocketbaseSingleton.getInstance();

const pocketbaseAdminConnection = pocketbaseAdmin.connection();

export { pocketbaseAdmin, pocketbaseAdminConnection };

export default pocketbase;
