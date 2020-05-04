---
date: 2020-04-29 18:37:17
layout: post
title: "MicroPaaS with Rio from Rancher"
subtitle:
description: What is Rio and how to use it?
image: /assets/img/kubernetes/rio/top.png
category: 'experimentation'
tags:
    - kubernetes
    - paas
author: dgilson
hidden: true
---

<small>*Vous pouvez trouver la version française [ici](/micropaas-with-rio-from-rancher).*</small>

The purpose of this article is to explain how to experiment with the Rio tool which includes many features.
Feel free to go to the [table of contents](#toc) if you are only interested in certain parts.

# Introduction

## What is Rio?

Rio is presented as an application deployment engine for Kubernetes or MicroPaaS.
It manages for you:
1. Which relates to routing and load-balancing
2. The auto scaling
3. Continuous deployment from Git
4. Blue/Green deployment

![how rio works](/assets/img/kubernetes/rio/how-it-works-rio.svg)

It's typically part of the DevOps movement and can provide a simple Kubernetes alternative to systems such as CloudFoundry or Azure Web Apps.

### Concepts

Let's clarify a few Rio concepts before we start:
* **Service** : set of identical scalable containers
* **Router** : load-balancing and traffic rules management
* **External Service** : registration of Ips or domain name in service mesh
* **Stack** : representation of a Riofile

## Tools used in this article
1. [Rio](https://rio.io/) from Rancher: Application deployment engine for Kubernetes (still in beta)
2. [Civo](https://www.civo.com/): Cloud platform from the UK which offers a way to deploy [k3s](https://k3s.io/) clusters in a few seconds (still in beta)
3. [Cloudflare](https://www.cloudflare.com/): proxy with firewall, certificate and domain management

## Why do we need an online cluster
Rio takes care of many things for us including the attribution of a domain name "on-rio" as well as its wild-card certificate (interesting for both development and production environments).

You must have a public fixed IP to allow Rio to provide this to you.

# Setting up the Kubernetes cluster
Go to the Civo interface to create our cluster. We have the choice on the size of the cluster as well as the power of each node.
For this article I will choose a cluster with two Medium nodes (a master that can be used as a worker as well as another worker). Using only the master node is sufficient for a development or test environment.

![civo price](/assets/img/kubernetes/rio/price.png)

Don't worry too much right now about the **number** of nodes you need because you will be able to add or remove them as you which.

Civo also offers you to preinstall applications. By default "Taerfik" and "Metrics Server" are installed and I also got into the habit of using Rancher as an interface for my clusters but we don't need any of that because all needed features will be installed by Rio. Make sure you have **unchecked all applications**.

![civo apps](/assets/img/kubernetes/rio/apps.png)

We can now click on the "Create" button and wait a few seconds for our cluster to be ready.

![civo creation](/assets/img/kubernetes/rio/creation.png)

Once the wait is over, you will be able to download the kubeconfig to allow you to access to the cluster from the `kubectl` CLI.

![download kubefilr](/assets/img/kubernetes/rio/download-kubefile.png)

The provided file is called "civo-rio-on-civo-kubeconfig" because I named my cluster "Rio on Civo".
You can easily use this file by adding the `--kubeconfig` parameter to each kubernetes CLI or by using the `KUBECONFIG` environment variable.

Examples:
* `kubectl --kubeconfig civo-rio-on-civo-kubeconfig get pods -A`
* `rio --kubeconfig civo-rio-on-civo-kubeconfig ps`

Or

* `export KUBECONFIG=civo-rio-on-civo-kubeconfig`
* `kubectl get pods -A`
* `rio ps`

***To focus on commands, I use the environment variable and therefore would not specify the `--kubeconfig` configuration in the rest of the article. Add the flag each time behind the word `rio` if you don't know how to create an environment variable on your OS.
For example, `rio ps` in the article gives `rio --kubeconfig civo-rio-on-civo-kubeconfig ps`.***

# Rio installation

## Rio CLI

The Rio CLI is to install on your local machine and is compatible with all OS running on amd64 or arm.

You can use the `curl -sfL https://get.rio.io | sh -` command (the script automatically detects the release to use) or install it manually by downloading the realease compatible with your local OS [here] (https://github.com/rancher/rio/releases). I personally chose the script because I'm on macOS.

## Installation on the cluster

The installation on the cluster is as simple as for the CLI, one command is enough (`install`):

```sh
rio install --email your@email.com
```

The `--email` flag will be used for the certificate request to Let's Encrypt.

By default all [features] (https://github.com/rancher/rio/blob/master/docs/install.md#features) are installed. You can disable them using the `--disable-features` flag.
If you use your own domain and wild-card certificate you can for example add `--disable-features rdns, letsencrypt` to your command.

You can also have more parameters if you want by using the `--yaml` flag which creates a yaml without applying it. You will then need to apply it after making the desired changes.

![rio deploy success](/assets/img/kubernetes/rio/deploy-success.png)

You can check that everything went well with this command (`pods`):

```sh
rio -n rio-system pods
```

![Great Success](/assets/img/kubernetes/rio/borat-success.gif)

You are already ready to deploy an application.

# Deployment from Github

The application that we are going to deploy is the minimalist demo provided by Rancher: [https://github.com/rancher/rio-demo](https://github.com/rancher/rio-demo).

## Repo composition

You notice that there are only 2 files:
* `main.go` a basic web service in Go
* `Dockerfile` how to create an environment to run the Go service
    * The Dockerfile includes the way to **build** `RUN [" go "," build "," -o "," demo "]` the project as well to **execute** `CMD [ "./demo"] ` it.

This structure shows another strength of the containers which is being able to create a reproducible environment.

## Deployment

Because the repo is public we only have to execute a command (`run`) that refer to it.

```sh
rio run -n cd-demo -p 8080 https://github.com/rancher/rio-demo
```

Here we have decided to publish our service with the name "cd-demo" and we map port 8080 to public port 80.
It's also possible to map other ports using for example `-p 81: 8081`.

All you have to do is execute the `ps` command to retrieve the information from the application you just deployed.

```sh
rio ps
```

![rio ps result](/assets/img/kubernetes/rio/rio-ps.png)

Go to the indicated url when the build and deployment are complete and you should have a nice little message provided by a secure site via https.

![rio service deploy result](/assets/img/kubernetes/rio/rio-service-deployed.png)


With this unique command you have not only generated and deployed your application but you have activated a **continuous deployment** because Rio will check every 15 seconds if a change has been made on git in order to update the application.

You can thus execute this command several times for several namespaces with different branches to deploy your different environments.

## Use a private (secure) Git

Several types of authentication are possible: Basic or SSH.

### Basic authentication

This method allows you to use the other commands as before without changing anything.

To save your authentication data in Rio, use the command (`secret`):

```sh
rio secret create --git-basic-auth
```

You will need to provide a URL informing which git to apply this secret to.
The other commands are not changed as said above.

### SSH authentication

To store the SSH key, you must also use the `secret` command but with the` --git-sshkey-auth` flag:

```sh
rio secret create --git-sshkey-auth
```

The command to launch a service changes a little to inform that you must use an SSH connection:

```sh
rio run --build-clone-secret gitcredential-ssh -p 8080 git@github.com/rancher/rio-demo
```

### Other secrets

Other types of secrets exist such as connection to a private docker registry.

You can see the different possible types of secrets using the help command: `rio secret create --help`.

Don't hesitate to take a look in the [documentation](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md) for more information.

## Pull Request

A strong point of Rio is that it can provision an instance for each PR. This allows you to see the result before merging without having to launch the application locally.

### Webhook configuration

To do this, you must create an access token on [Github] (https://github.com/settings/tokens)

![github access token](/assets/img/kubernetes/rio/github-token.png)

and create a webhook secret again with the same command and the `--github-webhook` flag:

```sh
rio secret add --git-sshkey-auth
```

### Deployment for PR

Use the `run` command with a new` --build-pr` flag

```sh
rio run -p 8080 -n example-cd --build-webhook-secret=githubtoken --build-pr --template https://github.com/rancher/rio-demo
```

*Want to know more about `--template`? Check [this](https://github.com/rancher/rio/blob/master/docs/continuous-deployment.md#automatic-versioning).*

# Dashboard

I think it's now time to inform you that there is a web dashboard allowing you to visually monitor your applications.

To keep it simple we can install it with a single command (`dashboard`):

```sh
rio dashboard
```

*The dashboard is installed but still not responding? Wait a little longer, the Dashboard takes longer to launch. You can check the launch of the dashboard using the `rio -n rio-system pods` command already used previously*

![rio dashboard](/assets/img/kubernetes/rio/dashboard.png)

You can find there everything you have done so far. The dashboard also allows you to deploy your applications without going through the CLI but is less stable. Remember that this is a beta version.

# Deploy a Docker image

It's as easy to deploy from a Docker image with Rio as it is to deploy this image on a local Docker. This is the same command (`run`) as for deployment via github and Rio automatically detects that it's an image name and not a Git link.

We use this command to deploy the example image [hello-world of rancher](https://hub.docker.com/r/rancher/hello-world):

```sh
rio run -n hello-world -p 80 rancher/hello-world
```

You can obviously use environment variables using the `--env` and` --env-file` flags.

You can use `ps` to get the domain name as done previously or check the list of services in the dashboard.

![rio dashboard service deployed](/assets/img/kubernetes/rio/service-deployed-dashboard.png)

# Deploy a local application

This point is one of those that I absolutely wanted to experiment because if there is something that bothers me for debugging environments: it's the fact of having to go through an image registry to be able to test a deployed application.

Fortunately Rio does everything for us using a local registry.

I take this opportunity to speak about another point which is the `RioFile`. It is a yaml file quite similar to a dockercompose one.

```yaml
services:
  dev:
    image: ./
    port: 8080/http
```

This file creates a service named "dev" based on `image`. The image can contain the name of a Docker image available in a register or a relative path. The relative path tells to Rio that it has to build the image itself.

This is the smallest Riofile file we can make. There are 1001 other options that you can specify in this file, so I invite you to go and discover them [in the official doc](https://github.com/rancher/rio/blob/master/docs/riofile.md).

The location of your folder (`./` In this case) must of course contain the source code of the application as well as a Dockerfile just as we saw in the [Repo composition](#Composition-of-repo) section.

It only remains to execute the `up` command to deploy our application.

```sh
rio up
```

We can then see all the steps by which it proceeds:

![local deployment](/assets/img/kubernetes/rio/local-deploy.png)

You can execute yourself one of the 2 steps through which it goes:
1. `rio build`: image build
2. `rio run -p 8080 localhost:5442/default/dev:latest` deploy the previously created image

# Scaling

Scaling is the fact of having several instances of the same service running in order to be able to more easily absorb the comput request by distributing it.

It can be managed in any way of creating a service: **run** command (`--scale`), **Riofile** (`scale` or `autoscale`) or via the **dashboard** .

## Manual

Scaling is managed when creating a service and it will be automatically set to `1` if you don't specify anything.

Don't worry you can change the scaling after its creation too using the `scale` command.

```sh
rio scale hello-world=2
```

This will launch a second instance of the "hello-world" service.

![scaling result](/assets/img/kubernetes/rio/after-scale.png)

You can also do it via the dashboard.

![scaling result](/assets/img/kubernetes/rio/scaling-dashboard.png)

What is interesting with the hello-world of rancher is that you can test the load-balancing between the two instances by refreshing its web page several times. The name behind "My hostname is" is unique per instance.

![scaling result](/assets/img/kubernetes/rio/hello-world.png)

## Automatic

The word "automatic scaling" may seem complicated at first but with Rio it's as simple as manual scaling. The only difference is that we have to specify a range (example: `1-10`).

There are two types of auto-scaling:
* cold (from 0): `0-10`
* hot (from at least 1): `1-10`

Please note that with cold auto-scaling there will be a latency of around 10 seconds while an instance is launched if none is started.

In order to test it you can use the command tool [hey] (https://github.com/rakyll/hey) which allows you to create a large number of simultaneous connections:

```sh
hey -z 3m -c 100 https://hello-world-v0-default.4a7p4l.on-rio.io/
```

You should see the number of instances (replicas) rise progressively with the command `ps`:

```sh
rio ps
```

![auto scaling result](/assets/img/kubernetes/rio/auto-scale.png)

# Router

Rio uses the Gateway API [Gloo](https://docs.solo.io/gloo/latest/) which allows you to add rules based on headers, path, cookies and more.

Let's start with a specific case: give access to our two applications (cd-demo and hello-world) from the same subdomain with two different paths.

We will use the `route add` command this way to create a routing rule based on a path: `rio route add $name/$path to $target`.
* `$name`: has to be replaced by the name of the router (is used to create a subdomain)
* `$path`: has to be replaced by the path on which you want your service to be accessible
* `$target`: has to be replaced by the name of the service to point

Let's create our first redirection of the **hello-world** service on the subdomain `test-default` (test = name of the router, default = name of the namespace) on the path`/hello-world`.
In other words `https://test-default.<rio-domain>/hello-world`.

```sh
rio route add test/hello-world to hello-world
```

To make sure the route is created you can use the `routers` command:

```sh
rio routers
```

![router list](/assets/img/kubernetes/rio/routers.png)

We can do the same with "cd-demo" but with one exception: We must specify the port because this application listens on port 8080.

```sh
rio route add test/cd-demo to cd-demo,port=8080
```

We now have an application that responds under the path `https://test-default.<rio-domain>/cd-demo`.

***Again, I prefer the CLI rather than the dashboard but everything is doable via the latter.***

![router list](/assets/img/kubernetes/rio/dashboard-router.png)

I don't need to go through all the mechanisms now you understand how the router works. I suggest you go to the [official documentation](https://github.com/rancher/rio/blob/master/docs/router.md) to find out about them.

# Your domain

The easiest way to use your own domain is to add a `CNAME` record that point to your `xxxxxx.on-rio.io` domain (findable from the `rio info` command).

I suggest that you use the free CloudFlare service to avoid any certificate problems .

To do so go to the DNS section to add the **CNAME**.

![cloudflare dns](/assets/img/kubernetes/rio/cloudflare-dns.png)

Here I have configured my domain so that "rio.wetry.eu" proxies to "test-default.4a7p4l.on-rio.io".

Make sure you have chosen "Fexible" as the encryption mode. This means that there will be encryption between our server and cloudflare, and an encryption between cloudflare and our browser, but not directly between our server and browser.

![cloudflare certificate](/assets/img/kubernetes/rio/cloudflare-certificate.png)

We just have to register this new domain in Rio using the `domain register` command.

```sh
rio domain register rio.wetry.eu test
```

*"test" is the name of the route created previously*

![custom dns result](/assets/img/kubernetes/rio/custom-domain-result.png)

# External services

The purpose of this functionality is to avoid playing with Ips or domains in our applications/services. You can manage them in a centralized place.

It is useful for communication between kubernetes namespaces, but also for accessing real external resources to the cluster.

## Other namespace

Imagine that we have an application **app2** in another namespace called **namespace2**, it's possible to access it for example with the name **ext2** via the `external create` command by this way:

```sh
rio external create ext2 namespace2:app2
```

## IP or domain name

To access an external service via a name (for example: *ext1*) we also use the `external create` command by providing it with one/some IPs or a domain name:

```sh
rio external create ext1 1.1.1.1 2.2.2.2
```

# Monitoring

It's possible to have access to the Linkerd as well as its grafana by using the command `linkerd` which creates a proxy between linkerd and your local network (127.0.0.1).

```sh
rio linkerd
```

**Linkerd**

![linkerd](/assets/img/kubernetes/rio/linkerd.png)

**Grafana**

![grafana](/assets/img/kubernetes/rio/grafana.png)

# Next step

A second part of this article will arrive later because we still have some features of this excellent tool to see.

---
<div class="gratitude">
    <span>THANK YOU</span>
    <p>for taking the time to read this article</p>
</div>

---

<div id="toc"></div>
**Table of Contents**
1. TOC
{:toc}

