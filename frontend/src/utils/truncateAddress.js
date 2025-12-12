export function truncateAddress(addr) {
    if (!addr) return "";
    
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}
