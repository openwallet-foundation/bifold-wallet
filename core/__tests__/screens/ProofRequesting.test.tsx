import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import { useNavigation } from "@react-navigation/core";
import { act, cleanup, render } from "@testing-library/react-native";
import React from "react";

import { defaultProofRequestTemplates } from "../../verifier/constants";
import { testIdWithKey } from "../../App";
import ProofRequesting from "../../App/screens/ProofRequesting";

jest.mock("react-native-permissions", () => require("react-native-permissions/mock"));
jest.mock("@react-native-community/netinfo", () => mockRNCNetInfo);
jest.mock("@react-navigation/core", () => {
  return require("../../__mocks__/custom/@react-navigation/core");
});
jest.mock("@react-navigation/native", () => {
  return require("../../__mocks__/custom/@react-navigation/native");
});
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("react-native-localize", () => {
});
jest.mock("react-native-device-info", () => () => jest.fn());

jest.useFakeTimers("legacy");
jest.spyOn(global, "setTimeout");

const templateId = defaultProofRequestTemplates[0].id;


describe("displays a proof requesting screen", () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Renders correctly", async () => {
    const tree = render(
      <ProofRequesting navigation={useNavigation()}
                       route={{ params: { templateId, predicateValues: {} } } as any} />);
    await act(async () => null)
    const sharedButton = tree.getByTestId(testIdWithKey('ShareLink'))
    expect(sharedButton).not.toBeNull()
    expect(tree).toMatchSnapshot()
  });
})
