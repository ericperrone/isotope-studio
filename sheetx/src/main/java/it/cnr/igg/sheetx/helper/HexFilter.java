package it.cnr.igg.sheetx.helper;

public class HexFilter {
	
    private static final String[] hexSymbols = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c",
            "d", "e", "f" };

    public static final StringBuilder toHexFromBytes(byte[] bytes) {

        StringBuilder hexBuilder = null;

        if ((bytes != null) && (bytes.length > 0)) {
            hexBuilder = new StringBuilder(bytes.length * 2);
            for (int i = 0; i < bytes.length; i++) {
                hexBuilder.append(toHexFromByte(bytes[i]));
            }
        } else {
            hexBuilder = new StringBuilder("");
        }

        return hexBuilder;
    }

    public static final StringBuilder toHexFromByte(byte b) {
        byte leftSymbol = (byte) (b >>> 4 & 0xF);
        byte rightSymbol = (byte) (b & 0xF);
        return new StringBuilder(hexSymbols[leftSymbol] + hexSymbols[rightSymbol]);
    }
}

