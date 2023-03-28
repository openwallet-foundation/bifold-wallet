import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import { useNavigation } from "@react-navigation/core";
import { cleanup, render } from "@testing-library/react-native";
import React from "react";

import Chat from "../../App/screens/Chat";
import path from "path";
import fs from "fs";
import { ConnectionRecord } from "@aries-framework/core";
import { useConnectionById } from "@aries-framework/react-hooks";
import { ConfigurationContext } from "../../App/contexts/configuration";
import configurationContext from "../contexts/configuration";
import { NetworkProvider } from "../../App";

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock("@react-native-community/netinfo", () => mockRNCNetInfo);
jest.mock('react-native-device-info', () => () => jest.fn())
jest.mock("@react-navigation/core", () => {
  return require("../../__mocks__/custom/@react-navigation/core");
});
jest.mock("@react-navigation/native", () => {
  return require("../../__mocks__/custom/@react-navigation/native");
});

const navigation = useNavigation();
const connectionPath = path.join(__dirname, "../fixtures/faber-connection.json");
const connection = JSON.parse(fs.readFileSync(connectionPath, "utf8"));
const connectionRecord = new ConnectionRecord(connection);
console.log(connection, connectionRecord);
// @ts-ignore
useConnectionById.mockReturnValue(connectionRecord);


describe("displays a Chat screen", () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Chat screen renders correctly", () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <Chat navigation={navigation as any} route={{ params: { connectionId: connectionRecord.id } } as any} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });
});
