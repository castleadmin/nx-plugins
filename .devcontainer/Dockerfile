FROM node:22-bookworm

# Install basic development tools
RUN apt update && apt install --yes man-db sudo less nano

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo "$USERNAME" ALL=\(root\) NOPASSWD:ALL > "/etc/sudoers.d/$USERNAME" && \
    chmod ug=r,o= "/etc/sudoers.d/$USERNAME"

WORKDIR "/home/$USERNAME"

# Install AWS CLI and AWS SAM CLI
RUN npm install --global nx && \
    curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' --silent --output 'aws-cli-v2.zip' && \
    unzip 'aws-cli-v2.zip' -d 'aws-cli-v2' && \
    sudo './aws-cli-v2/aws/install' && \
    curl 'https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip' --location --silent --output 'aws-sam-cli.zip' && \
    unzip 'aws-sam-cli.zip' -d 'aws-sam-cli' && \
    sudo './aws-sam-cli/install'

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true
