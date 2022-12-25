FROM mcr.microsoft.com/dotnet/sdk:6.0 as development

# Install git, to ensure the git tools work within vs-code
RUN apt-get update \
    && apt-get install -y \
    software-properties-common \
    npm \
    && apt-get install git-all --no-install-recommends -y
RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest

WORKDIR /usr/app
COPY ./ /usr/app/

WORKDIR /app
EXPOSE 8008