#!/bin/bash
docker rm -f gitlab-ce 2>/dev/null || true
docker run -d \
  --name gitlab-ce \
  --hostname gitlab.local \
  -p 8090:8090 \
  -p 2223:22 \
  -e GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.local:8090';" \
  gitlab/gitlab-ce:latest
