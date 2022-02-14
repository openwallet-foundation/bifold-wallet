/*
   Copyright 2021 Queen’s Printer for Ontario
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   https://www.npmjs.com/package/react-native-argon2
*/

import argon2 from 'react-native-argon2'

export async function hashPin(pin: string, salt: string) {
  //This should be set some how like fetched from a server or something
  const result = await argon2(pin, salt, {})
  const { rawHash, encodedHash } = result
  return rawHash
}
