import {MicroRequest} from "./micro-request";
import {disableFetchMocks, enableFetchMocks} from "jest-fetch-mock";

describe("Class MicroRequest", () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(global, "setTimeout");
        enableFetchMocks();
    });

    afterAll(() => {
        disableFetchMocks();
        jest.useRealTimers();
    });

    let headers = {"example-header": "one", "another-example-header": "two"};
    let parameters = {example1: "parameter1", example2: "parameter2"};
    let path = "https://hello.de/api/nowhere";
    let retry: number | undefined;

    let microRequest: MicroRequest;

    let successSpy: jest.Mock;
    let errorSpy: jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks();

        successSpy = jest.fn();
        errorSpy = jest.fn();

        microRequest = new MicroRequest(
            {
                get path() {
                    return path;
                },
                get params() {
                    return parameters;
                },
                get headers() {
                    return headers;
                },
                get retry() {
                    return retry;
                },
            },
            successSpy,
            errorSpy,
        );
    });

    afterEach(() => {
        microRequest.stop();
    });

    it("does not fetch on instantiation", () => {
        expect(fetch).not.toBeCalled();
    });

    describe("when a request is made and fetch fails", () => {
        beforeEach(() => {
            fetchMock.mockReject();
        });

        it("should not reject the promise", () => {
            expect(async () => await microRequest.start()).not.toThrow();
        });

        it("should have called fetch", async () => {
            await microRequest.start();
            expect(fetch).toBeCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith("https://hello.de/api/nowhere?example1=parameter1&example2=parameter2", {
                headers: {"another-example-header": "two", "example-header": "one"},
                method: undefined,
                signal: expect.any(AbortSignal),
            });
        });

        it("should not have called the success callback", async () => {
            await microRequest.start();
            expect(successSpy).not.toHaveBeenCalled();
        });

        it("should trigger the error callback", async () => {
            await microRequest.start();
            expect(errorSpy).toBeCalledTimes(1);
        });

        it("should trigger a retry (default)", async () => {
            await microRequest.start();
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
        });

        it("should trigger a retry (with value of retry)", async () => {
            retry = 1000;
            await microRequest.start();
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
        });
    });

    describe("when request is aborted", () => {
        beforeEach(async () => {
            fetchMock.mockAbort();
            await microRequest.start();
        });

        it("should not have called the success callback", () => {
            expect(successSpy).not.toHaveBeenCalled();
        });

        it("should not call the error callback", () => {
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it("should not init a retry", () => {
            expect(setTimeout).not.toHaveBeenCalled();
        });
    });
});
