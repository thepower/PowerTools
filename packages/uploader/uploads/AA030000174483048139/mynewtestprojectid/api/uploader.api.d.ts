export declare class UploaderApi {
    private jwt;
    login(address: string, wif: string): Promise<void>;
    uploadProject(projectId: string, path: string, manifest: string): Promise<void>;
}
