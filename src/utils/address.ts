export function addr_equal(
  addr1: string | undefined,
  addr2: string | undefined
) {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
}

export function addr_includes(addrs: string[], addr: string | undefined) {
  if (!addr) return false;
  return addrs.map((v) => v.toLowerCase()).includes(addr.toLowerCase());
}
