import {
  INDY_PROOF_REQUEST_ATTACHMENT_ID,
  ProofExchangeRecord,
  ProofState,
  V1RequestPresentationMessage
} from "@aries-framework/core";
import { Attachment, AttachmentData } from "@aries-framework/core/build/decorators/attachment/Attachment";
import { useProofById } from "@aries-framework/react-hooks";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import { useNavigation } from "@react-navigation/core";
import "@testing-library/jest-native/extend-expect";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { testIdWithKey } from "../../App/utils/testable";
import ProofDetails from "../../App/screens/ProofDetails";

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");
jest.mock("@react-native-community/netinfo", () => mockRNCNetInfo);
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("@react-navigation/core", () => {
  return require("../../__mocks__/custom/@react-navigation/core");
});
jest.mock("@react-navigation/native", () => {
  return require("../../__mocks__/custom/@react-navigation/native");
});

jest.useFakeTimers("legacy");
jest.spyOn(global, "setTimeout");

const requestPresentationMessage = new V1RequestPresentationMessage({
  comment: "some comment",
  requestPresentationAttachments: [
    new Attachment({
      id: INDY_PROOF_REQUEST_ATTACHMENT_ID,
      mimeType: "application/json",
      data: new AttachmentData({
        json: {
          name: "test proof request",
          version: "1.0.0",
          nonce: "1",
          requestedAttributes: {
            email: {
              name: "email"
            },
            time: {
              names: ["time"]
            }
          },
          requestedPredicates: {}
        }
      })
    })
  ]
});

describe("displays a proof details screen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("with a verified history proof record details", () => {
    const testVerifiedProofRequest = new ProofExchangeRecord({
      connectionId: "123",
      threadId: requestPresentationMessage.id,
      state: ProofState.RequestReceived,
      protocolVersion: "V1",
      isVerified: true
    });

    beforeEach(() => {
      jest.clearAllMocks();

      // @ts-ignore
      useProofById.mockReturnValue(testVerifiedProofRequest);
    });

    test("History view should be rendered correctly", async () => {
      const { getByTestId } = render(
        <ProofDetails navigation={useNavigation()}
                      route={{ params: { recordId: "", isHistory: true } } as any} />);
      const historyView = await getByTestId(testIdWithKey("HistoryView"));
      expect(historyView).not.toBeNull();
    });

    test("History view should not be rendered", async () => {
      const { queryByTestId } = render(
        <ProofDetails navigation={useNavigation()}
                      route={{ params: { recordId: "", isHistory: false } } as any} />);
      const historyView = await queryByTestId(testIdWithKey("HistoryView"));
      expect(historyView).toBeNull();
    });
  });

  describe("with a verified proof record details", () => {
    const testVerifiedProofRequest = new ProofExchangeRecord({
      connectionId: "123",
      threadId: requestPresentationMessage.id,
      state: ProofState.RequestReceived,
      protocolVersion: "V1",
      isVerified: true
    });

    beforeEach(() => {
      jest.clearAllMocks();

      // @ts-ignore
      useProofById.mockReturnValue(testVerifiedProofRequest);
    });

    test("Generate new QR code button should navigate correctly", async () => {
      const navigation = useNavigation();
      const { getByTestId } = render(
        <ProofDetails navigation={useNavigation()}
                      route={{ params: { recordId: "", isHistory: false } } as any} />);
      const generateQRCodeButton = await getByTestId(testIdWithKey("GenerateNewQR"));
      expect(generateQRCodeButton).not.toBeNull();
      fireEvent(generateQRCodeButton, "press")
      expect(navigation.navigate).toBeCalledWith("Proof Requests", {})
    });
  });
  describe("with a unverified proof record details", () => {

    const testUnverifiedProofRequest = new ProofExchangeRecord({
      connectionId: "123",
      threadId: requestPresentationMessage.id,
      state: ProofState.RequestReceived,
      protocolVersion: "V1",
      isVerified: false
    });

    beforeEach(() => {
      jest.clearAllMocks();

      // @ts-ignore
      useProofById.mockReturnValue(testUnverifiedProofRequest);
    });

    test("Unverified proof view should be rendered correctly", async () => {
      const { getByTestId } = render(
        <ProofDetails navigation={useNavigation()}
                      route={{ params: { recordId: "" } } as any} />);
      const unverifiedView = await getByTestId(testIdWithKey("UnverifiedProofView"));
      expect(unverifiedView).not.toBeNull();
    });
  });
});
