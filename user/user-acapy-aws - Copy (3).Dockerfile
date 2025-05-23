# ARG python_version=3.9.18
# ARG rust_version=1.46

# # This image could be replaced with an "indy" image from another repo,
# # such as the indy-sdk
# FROM rust:${rust_version}-slim as indy-builder

# ARG user=indy
# ENV HOME="/home/$user"
# WORKDIR $HOME
# RUN mkdir -p .local/bin .local/etc .local/lib

# # Install environment
# RUN apt-get update -y && \
#     apt-get install -y --no-install-recommends \
#     automake \
#     build-essential \
#     ca-certificates \
#     cmake \
#     curl \
#     git \
#     libbz2-dev \
#     libffi-dev \
#     libgmp-dev \
#     liblzma-dev \
#     libncurses5-dev \
#     libncursesw5-dev \
#     libsecp256k1-dev \
#     libsodium-dev \
#     libsqlite3-dev \
#     libssl-dev \
#     libtool \
#     libzmq3-dev \
#     pkg-config \
#     zlib1g-dev && \
#     rm -rf /var/lib/apt/lists/*

# # set to --release for smaller, optimized library
# ARG indy_build_flags=--release

# ARG indy_version=1.16.0
# ARG indy_sdk_url=https://codeload.github.com/hyperledger/indy-sdk/tar.gz/refs/tags/v${indy_version}

# # make local libs and binaries accessible
# ENV PATH="$HOME/.local/bin:$PATH"
# ENV LIBRARY_PATH="$HOME/.local/lib:$LIBRARY_PATH"

# # Download and extract indy-sdk
# RUN mkdir indy-sdk && \
#     curl "${indy_sdk_url}" | tar -xz -C indy-sdk

# # Build and install indy-sdk
# WORKDIR $HOME/indy-sdk
# RUN cd indy-sdk*/libindy && \
#     cargo build ${indy_build_flags} && \
#     cp target/*/libindy.so "$HOME/.local/lib" && \
#     cargo clean

# # Package python3-indy
# RUN tar czvf ../python3-indy.tgz -C indy-sdk*/wrappers/python .

# # grab the latest sdk code for the postgres plug-in
# WORKDIR $HOME
# ARG indy_postgres_url=${indy_sdk_url}
# RUN mkdir indy-postgres && \
#     curl "${indy_postgres_url}" | tar -xz -C indy-postgres

# # Build and install postgres_storage plugin
# WORKDIR $HOME/indy-postgres
# RUN cd indy-sdk*/experimental/plugins/postgres_storage && \
#     cargo build ${indy_build_flags} && \
#     cp target/*/libindystrgpostgres.so "$HOME/.local/lib" && \
#     cargo clean

# # Clean up SDK
# WORKDIR $HOME
# RUN rm -rf indy-sdk indy-postgres


# # Indy Base Image
# # This image could be replaced with an "indy-python" image from another repo,
# # such as the indy-sdk
# FROM python:${python_version}-slim-bullseye as indy-base

# ARG uid=1001
# ARG user=indy
# ARG indy_version

# ENV HOME="/home/$user" \
#     APP_ROOT="$HOME" \
#     LC_ALL=C.UTF-8 \
#     LANG=C.UTF-8 \
#     PIP_NO_CACHE_DIR=off \
#     PYTHONUNBUFFERED=1 \
#     PYTHONIOENCODING=UTF-8 \
#     RUST_LOG=warn \
#     SHELL=/bin/bash \
#     SUMMARY="indy-python base image" \
#     DESCRIPTION="aries-cloudagent provides a base image for running Hyperledger Aries agents in Docker. \
#     This image provides all the necessary dependencies to use the indy-sdk in python. Based on Debian bullseye."

# LABEL summary="$SUMMARY" \
#     description="$DESCRIPTION" \
#     io.k8s.description="$DESCRIPTION" \
#     io.k8s.display-name="indy-python $indy_version" \
#     name="indy-python" \
#     indy-sdk.version="$indy_version" \
#     maintainer=""

# # Add indy user
# RUN useradd -U -ms /bin/bash -u $uid $user

# # Install environment
# RUN apt-get update -y && \
#     apt-get install -y --no-install-recommends \
#     apt-transport-https \
#     ca-certificates \
#     build-essential \
#     bzip2 \
#     curl \
#     git \
#     less \
#     libffi-dev \
#     libgmp10 \
#     liblzma5 \
#     libncurses5 \
#     libncursesw5 \
#     libsecp256k1-0 \
#     libzmq5 \
#     net-tools \
#     openssl \
#     sqlite3 \
#     zlib1g && \
#     rm -rf /var/lib/apt/lists/* /usr/share/doc/*

# WORKDIR $HOME

# # Copy build results
# COPY --from=indy-builder --chown=$user:$user $HOME .

# RUN mkdir -p $HOME/.local/bin

# # Add local binaries and aliases to path
# ENV PATH="$HOME/.local/bin:$PATH"

# # Make libraries resolvable by python
# ENV LD_LIBRARY_PATH="$HOME/.local/lib:$LD_LIBRARY_PATH"
# RUN echo "$HOME/.local/lib" > /etc/ld.so.conf.d/local.conf && ldconfig

# # Install python3-indy
# RUN pip install --no-cache-dir python3-indy.tgz && rm python3-indy.tgz

# # - In order to drop the root user, we have to make some directories writable
# #   to the root group as OpenShift default security model is to run the container
# #   under random UID.
# RUN usermod -a -G 0 $user

# # Create standard directories to allow volume mounting and set permissions
# # Note: PIP_NO_CACHE_DIR environment variable should be cleared to allow caching
# RUN mkdir -p \
#     $HOME/.aries_cloudagent \
#     $HOME/.cache/pip/http \
#     $HOME/.indy_client/wallet \
#     $HOME/.indy_client/pool \
#     $HOME/.indy_client/ledger-cache \
#     $HOME/ledger/sandbox/data \
#     $HOME/log

# # The root group needs access the directories under $HOME/.indy_client and $HOME/.aries_cloudagent for the container to function in OpenShift.
# RUN chown -R $user:root $HOME/.indy_client $HOME/.aries_cloudagent && \
#     chmod -R ug+rw $HOME/log $HOME/ledger $HOME/.aries_cloudagent $HOME/.cache $HOME/.indy_client

# USER $user

# CMD ["bash"]


# # ACA-Py Test
# # Used to run ACA-Py unit tests with Indy
# FROM indy-base as acapy-test

# USER indy

# RUN mkdir src test-reports

# WORKDIR /home/indy/src

# RUN mkdir -p test-reports && chown -R indy:indy test-reports && chmod -R ug+rw test-reports

# ADD ./README.md pyproject.toml ./poetry.lock ./
# COPY ./aries_cloudagent/ ./aries_cloudagent/

# USER root
# RUN pip install --no-cache-dir poetry
# RUN poetry install --compile -E "askar bbs indy"

# ADD --chown=indy:root . .
# USER indy

# ENTRYPOINT ["/bin/bash", "-c", "poetry run pytest \"$@\"", "--"]

# # ACA-Py Builder
# # Build ACA-Py wheel using setuptools
# FROM python:${python_version}-slim-bullseye AS acapy-builder

# WORKDIR /src

# ADD . .

# RUN pip install --no-cache-dir poetry
# RUN poetry build


# # ACA-Py Indy
# # Install wheel from builder and commit final image
# FROM indy-base AS main

# ARG uid=1001
# ARG user=indy
# ARG acapy_version
# ARG acapy_reqs=[askar,bbs]

# ENV HOME="/home/$user" \
#     APP_ROOT="$HOME" \
#     LC_ALL=C.UTF-8 \
#     LANG=C.UTF-8 \
#     PIP_NO_CACHE_DIR=off \
#     PYTHONUNBUFFERED=1 \
#     PYTHONIOENCODING=UTF-8 \
#     RUST_LOG=warn \
#     SHELL=/bin/bash \
#     SUMMARY="aries-cloudagent image" \
#     DESCRIPTION="aries-cloudagent provides a base image for running Hyperledger Aries agents in Docker. \
#     This image layers the python implementation of aries-cloudagent $acapy_version. \
#     This image includes indy-sdk and supporting libraries."

# LABEL summary="$SUMMARY" \
#     description="$DESCRIPTION" \
#     io.k8s.description="$DESCRIPTION" \
#     io.k8s.display-name="aries-cloudagent $acapy_version" \
#     name="aries-cloudagent" \
#     acapy.version="$acapy_version" \
#     maintainer=""

# # Install ACA-py from the wheel as $user,
# # and ensure the permissions on the python 'site-packages' folder are set correctly.
# COPY --from=acapy-builder /src/dist/aries_cloudagent*.whl .
# RUN aries_cloudagent_package=$(find ./ -name "aries_cloudagent*.whl" | head -n 1) && \
#     echo "Installing ${aries_cloudagent_package} ..." && \
#     pip install --no-cache-dir --find-links=. ${aries_cloudagent_package}${acapy_reqs} && \
#     rm aries_cloudagent*.whl && \
#     chmod +rx $(python -m site --user-site)

# # Clean-up unneccessary build dependencies and reduce final image size
# USER root
# RUN apt-get purge -y --auto-remove build-essential

# USER $user

ARG python_version=3.9.18
FROM python:${python_version}-slim-bullseye AS build

WORKDIR /src

ADD . .

RUN pip install --no-cache-dir poetry
RUN poetry build

FROM python:${python_version}-slim-bullseye AS main

ARG uid=1001
ARG user=aries
ARG acapy_version
ARG acapy_reqs=[askar,bbs,indy]

ENV HOME="/home/$user" \
    APP_ROOT="$HOME" \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    PIP_NO_CACHE_DIR=off \
    PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    RUST_LOG=warn \
    SHELL=/bin/bash \
    SUMMARY="aries-cloudagent image" \
    DESCRIPTION="aries-cloudagent provides a base image for running Hyperledger Aries agents in Docker. \
    This image layers the python implementation of aries-cloudagent $acapy_version. Based on Debian Buster."

LABEL summary="$SUMMARY" \
    description="$DESCRIPTION" \
    io.k8s.description="$DESCRIPTION" \
    io.k8s.display-name="aries-cloudagent $acapy_version" \
    name="aries-cloudagent" \
    acapy.version="$acapy_version" \
    maintainer=""

# Add aries user
RUN useradd -U -ms /bin/bash -u $uid $user

# Install environment
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    build-essential \
    bzip2 \
    curl \
    git \
    less \
    libffi-dev \
    libgmp10 \
    liblzma5 \
    libncurses5 \
    libncursesw5 \
    libsecp256k1-0 \
    libzmq5 \
    net-tools \
    openssl \
    sqlite3 \
    zlib1g && \
    rm -rf /var/lib/apt/lists/* /usr/share/doc/*

WORKDIR $HOME

# Add local binaries and aliases to path
ENV PATH="$HOME/.local/bin:$PATH"

# - In order to drop the root user, we have to make some directories writable
#   to the root group as OpenShift default security model is to run the container
#   under random UID.
RUN usermod -a -G 0 $user

# Create standard directories to allow volume mounting and set permissions
# Note: PIP_NO_CACHE_DIR environment variable should be cleared to allow caching
RUN mkdir -p \
    $HOME/.aries_cloudagent \
    $HOME/.cache/pip/http \
    $HOME/.indy_client \
    $HOME/ledger/sandbox/data \
    $HOME/log

# The root group needs access the directories under $HOME/.indy_client and $HOME/.aries_cloudagent for the container to function in OpenShift.
RUN chown -R $user:root $HOME/.indy_client $HOME/.aries_cloudagent && \
    chmod -R ug+rw $HOME/log $HOME/ledger $HOME/.aries_cloudagent $HOME/.cache $HOME/.indy_client

# Create /home/indy and symlink .indy_client folder for backwards compatibility with artifacts created on older indy-based images.
RUN mkdir -p /home/indy
RUN ln -s /home/aries/.indy_client /home/indy/.indy_client

# Install ACA-py from the wheel as $user,
# and ensure the permissions on the python 'site-packages' and $HOME/.local folders are set correctly.
USER $user
COPY --from=build /src/dist/aries_cloudagent*.whl .
RUN aries_cloudagent_package=$(find ./ -name "aries_cloudagent*.whl" | head -n 1) && \
    echo "Installing ${aries_cloudagent_package} ..." && \
    pip install --no-cache-dir --find-links=. ${aries_cloudagent_package}${acapy_reqs} && \
    rm aries_cloudagent*.whl && \
    chmod +rx $(python -m site --user-site) $HOME/.local

# Clean-up unneccessary build dependencies and reduce final image size
USER root
RUN apt-get purge -y --auto-remove build-essential

USER $user



# Run with the WALLET_STORAGE_CONFIG env var:
CMD aca-py start --wallet-storage-type postgres_storage --wallet-storage-config "$WALLET_STORAGE_CONFIG" --wallet-storage-creds '{"account":"testuser","password":"testpassword","admin_account":"testuser","admin_password":"testpassword"}' --inbound-transport http 0.0.0.0 8030 --outbound-transport http --endpoint "$ENDPOINT_URL" --webhook-url "$WEBHOOK_URL" --genesis-url 'http://prod.bcovrin.vonx.io/genesis' --auto-accept-invites --auto-accept-requests --auto-ping-connection --auto-respond-messages --auto-respond-credential-proposal --auto-respond-credential-offer --auto-respond-credential-request --auto-verify-presentation --label user.agent --log-level 'debug' --admin-insecure-mode --admin 0.0.0.0 8031 --auto-provision --wallet-type askar --wallet-name user-wallet --wallet-key wallet-password

# CMD ["aca-py", "start", "--wallet-storage-config", '{"url":"acapy_agent_db.employee:5432","max_connections":5,"wallet_scheme":"DatabasePerWallet"}', "--wallet-storage-creds", '{"account":"testuser","password":"testpassword","admin_account":"testuser","admin_password":"testpassword"}', "--inbound-transport", "http", "0.0.0.0", "8030", "--outbound-transport", "http", "--endpoint", "http://employee.sharetrace.us:8030", "--label", "user.agent", "--admin-insecure-mode", "--admin", "0.0.0.0", "8031", "--no-ledger", "--auto-provision", "--wallet-type", "askar", "--wallet-name", "user-wallet", "--wallet-key", "wallet-password", "--wallet-storage-type", "postgres_storage"]
