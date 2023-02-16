## Suggested Setup for Mac OS ARM64 architecture
1. Install [Homebrew](https://brew.sh/)
    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    Follow post installation instructions. The following should be added to your `~/.zprofile`
    ```sh
    # Set PATH, MANPATH, etc., for Homebrew.
    eval "$(/opt/homebrew/bin/brew shellenv)"
    ```
    IMPORTANT: close and start a new terminal session

1. Install Watchman
    ```
    brew install watchman
    ```

1. Install NVM
    ```
    brew install nvm
    ```
    Follow post installation instructions. The following should be added to your `~/.zprofile`
    ```sh
    source $(brew --prefix nvm)/nvm.sh
    ```
1. Install Node
    ```sh
    nvm install 16.15.0
    ```
    Activate node version by adding the following to your `~/.zprofile`
    ```sh
    source $(brew --prefix nvm)/nvm.sh
    nvm use 16.15.0
    ```
1. Install Yarn
    ```sh
    corepack enable
    corepack prepare yarn@3.3.1 --activate
    ```
    IMPORTANT: Check `packageManager` for the exact and up-todate version in the root [package.json](./package.json)
1. Manually Download and Install Android Studio as per documentation:
https://developer.android.com/studio

    1. Setup Android SDK by adding the following to your `~/.zprofile`
        ```sh
        # The ordering is important!!!
        export ANDROID_HOME=$HOME/Library/Android/sdk
        export PATH=$PATH:$ANDROID_HOME/emulator
        export PATH=$PATH:$ANDROID_HOME/tools
        export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
        export PATH=$PATH:$ANDROID_HOME/tools/bin
        export PATH=$PATH:$ANDROID_HOME/platform-tools
        ```
        IMPORTANT: close and start a new terminal session
    1. Install additional build tools
        ```sh
        sdkmanager --install "emulator" "build-tools;31.0.0" "cmake;3.22.1" "platforms;android-31" "ndk;25.1.8937393" "system-images;android-31;google_apis;arm64-v8a"
        ```
    1. Setup Build Tools
        ```sh
        export PATH=$PATH:$ANDROID_HOME/cmake/3.22.1/bin
        ```
    1. Create Android Virtual Device (AVD)
        ```sh
        avdmanager --verbose create avd --force --name Pixel_6_API_31 --device "pixel_6" --package "system-images;android-31;google_apis;arm64-v8a" --tag "google_apis" --abi "arm64-v8a"
        ```
    1. Start Emulator (AVD)
        ```sh
        emulator -avd Pixel_6_API_31 -netdelay none -netspeed full
        ```
1. Install and Activate Java
    1. Install Java
        ```sh
        brew install --cask zulu11
        ```
    1. Activate Java by adding the following to your `~/.zprofile`
        ```sh
        # check output of /usr/libexec/java_home -V
        alias java11="export JAVA_HOME=\"/Library/Java/JavaVirtualMachines/zulu-11.jdk/Contents/Home\""
        java11 # optional if you want to have Java 11 always enabled by default
        ```
        IMPORTANT: close and start a new terminal session
