#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

/* Test-only preload guard: a demo that attempts any outbound socket connect
 * leaves an observable log entry and fails instead of reaching the network. */
int connect(int fd, const struct sockaddr *address, socklen_t length) {
  (void)fd;
  (void)address;
  (void)length;
  const char *path = getenv("BOUNDARY_REPLAY_CONNECT_LOG");
  if (path) {
    int log = open(path, O_WRONLY | O_CREAT | O_APPEND, 0600);
    if (log >= 0) {
      ssize_t written = write(log, "connect\n", 8);
      (void)written;
      close(log);
    }
  }
  errno = EPERM;
  return -1;
}
