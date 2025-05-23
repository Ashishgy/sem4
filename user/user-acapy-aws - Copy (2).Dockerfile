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
CMD aca-py start --wallet-storage-type postgres_storage --wallet-storage-config "$WALLET_STORAGE_CONFIG" --wallet-storage-creds '{"account":"testuser","password":"testpassword","admin_account":"testuser","admin_password":"testpassword"}' --inbound-transport http 0.0.0.0 8030 --outbound-transport http --endpoint "$ENDPOINT_URL" --webhook-url "$WEBHOOK_URL" --genesis-url 'http://prod.bcovrin.vonx.io/genesis' --auto-accept-invites --auto-accept-requests --auto-ping-connection --auto-respond-messages --auto-respond-credential-proposal --auto-respond-credential-offer --auto-respond-credential-request --auto-verify-presentation --label user.agent --log-level 'debug' --admin-insecure-mode --admin 0.0.0.0 8031 --no-ledger --auto-provision --wallet-type indy --wallet-name user-wallet --wallet-key wallet-password

# CMD ["aca-py", "start", "--wallet-storage-config", '{"url":"acapy_agent_db.employee:5432","max_connections":5,"wallet_scheme":"DatabasePerWallet"}', "--wallet-storage-creds", '{"account":"testuser","password":"testpassword","admin_account":"testuser","admin_password":"testpassword"}', "--inbound-transport", "http", "0.0.0.0", "8030", "--outbound-transport", "http", "--endpoint", "http://employee.sharetrace.us:8030", "--label", "user.agent", "--admin-insecure-mode", "--admin", "0.0.0.0", "8031", "--no-ledger", "--auto-provision", "--wallet-type", "askar", "--wallet-name", "user-wallet", "--wallet-key", "wallet-password", "--wallet-storage-type", "postgres_storage"]
