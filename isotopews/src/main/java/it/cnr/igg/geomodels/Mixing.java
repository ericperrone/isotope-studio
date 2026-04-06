package it.cnr.igg.geomodels;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.logging.log4j.util.PropertySource.Comparator;

import it.cnr.igg.helper.MathTools;
import it.cnr.igg.itineris.beans.ItinerisMixingOutBean;

import java.math.BigDecimal;
import java.math.MathContext;

class MixSample {
	public String member;
	public String element;
	public Double f;
}

class PlottedResult {
	public Double[] weights;
	public GeoData geoData;
}

class MixingResult {
	public ArrayList<MixSample> samples;
	public Double mix;
}

class MixingOutput {
	public ArrayList<MixingResult> results;
	public GeoData[] geoData;
}

public class Mixing {
	private GeoData[] data = null;
	private double step = 0.01d, startValue = 0d, endValue = 1d;
	private ArrayList<MixingResult> results = null;
	private MixingOutput mixingOutput = new MixingOutput();

	public ItinerisMixingOutBean map(MixingResult mr) {
		ItinerisMixingOutBean imb = new ItinerisMixingOutBean();
		imb.setMemberOneMember(mr.samples.get(0).member);
		imb.setMemberTwoMember(mr.samples.get(1).member);
		imb.setMemberOneElement(mr.samples.get(0).element);
		imb.setMemberTwoElement(mr.samples.get(1).element);
		imb.setMemberOneF(mr.samples.get(0).f);
		imb.setMemberTwoF(mr.samples.get(1).f);
		imb.mix = mr.mix;
		return imb;
	}
	
	public Mixing() {
		this.data = null;
	}

	public Mixing(GeoData[] data) {
		this.data = data;
		mixingOutput.geoData = data;
	}

	public void setData(GeoData[] data) {
		this.data = data;
		mixingOutput.geoData = data;
	}

	public void setStep(double step) {
		this.step = step;
	}

	public void setStartValue(double startValue) {
		this.startValue = startValue;
	}

	public void setEndValue(double endValue) {
		this.endValue = endValue;
	}

	public ArrayList<MixingResult> getResult() {
		return this.results;
	}

	public MixingOutput getMixingOutput() {
		return mixingOutput;
	}
	
	public ArrayList<ItinerisMixingOutBean> getMix() {
		ArrayList<ItinerisMixingOutBean> out = new ArrayList<ItinerisMixingOutBean>();
		for (MixingResult r : mixingOutput.results)
			out.add(map(r));
		return out;
	}

	public PlottedResult getPlotted() throws Exception {
		int dim = data[0].getXs().length;
		Double[][] A = new Double[dim][dim];
		switch (dim) {
		case 2:
			fill2(A);
			break;
		case 3:
			fill3(A);
			break;
		default:
			throw new Exception("Unsopported number of variable: " + dim);
		}
		Double[] v = {data[0].getPlottedX(), data[0].getPlottedY(), 1d};
		Double[] solution = MathTools.solveSystem(A, v);
		for (Double s : solution) {
			if (s < 0d || s > 1d) {
				throw new Exception("No solution");
			}
		}
		PlottedResult result = new PlottedResult();
		result.geoData = data[0];
		result.weights = solution;
		return result;
	}
	
	private void fill2(Double[][] A) {
		A[0][0] = data[0].getXs()[0].concentration;
		A[0][1] = data[0].getYs()[0].concentration;
		A[1][0] = 1d;
		A[1][1] = 1d;
	}
	
	private void fill3(Double[][] A) {
		A[0][0] = data[0].getXs()[0].concentration;
		A[0][1] = data[0].getXs()[1].concentration;
		A[0][2] = data[0].getXs()[2].concentration;
		A[1][0] = data[0].getYs()[0].concentration;
		A[1][1] = data[0].getYs()[1].concentration;
		A[1][2] = data[0].getYs()[2].concentration;
		A[2][0] = 1d;
		A[2][1] = 1d;	
		A[2][2] = 1d;
	}		

	public void compute() {
		if (data != null) {
			results = new ArrayList<MixingResult>();
			for (GeoData gd : data) {
				setStep(gd.getStep());
				compute(gd);
			}
			mixingOutput.results = results;
		}
	}

	public void compute(GeoData gd) {
		ArrayList<BigDecimal> c1 = new ArrayList<BigDecimal>();
		ArrayList<BigDecimal> c2 = new ArrayList<BigDecimal>();
		Member[] members = gd.getMembers();
		for (Member m : members) {
			c1.add(BigDecimal.valueOf(m.concentration));
			c2.add(BigDecimal.valueOf(m.concentration2));
		}
		ArrayList<ArrayList<BigDecimal>> fi = fn2(members.length);

		ArrayList<ArrayList<MixSample>> index = new ArrayList<ArrayList<MixSample>>();
		for (int j = 0; j < fi.size(); j++) {
			index.add(new ArrayList<MixSample>());
			for (int i = 0; i < fi.get(j).size(); i++) {
				MixSample s = new MixSample();
				s.member = members[i].member;
				s.element = members[i].element;
				s.f = fi.get(j).get(i).doubleValue();
				index.get(j).add(s);
			}
		}

		ArrayList<BigDecimal> cm = new ArrayList<BigDecimal>();
		if (checkIsotope(c2)) {
			for (int i = 0; i < fi.size(); i++) {
				cm.add(computeIsotope(c1, c2, fi.get(i)));
				MixingResult result = new MixingResult();
				result.samples = index.get(i);
				result.mix = cm.get(i).doubleValue();
				results.add(result);
			}
		} else {
			for (int i = 0; i < fi.size(); i++) {
				cm.add(computeConcentration(c1, fi.get(i)));
				MixingResult result = new MixingResult();
				result.samples = index.get(i);
				result.mix = cm.get(i).doubleValue();
				results.add(result);
			}
		}

		return;
	}

	private ArrayList<Double> toDoubles(ArrayList<BigDecimal> bd) {
		ArrayList<Double> d = new ArrayList<Double>();
		for (BigDecimal b : bd) {
			d.add(b.doubleValue());
		}
		return d;
	}

	private boolean checkIsotope(ArrayList<BigDecimal> c2) {
		BigDecimal s = BigDecimal.valueOf(0d);
		for (BigDecimal c : c2) {
			s = s.add(c);
		}
		return s.compareTo(BigDecimal.valueOf(0d)) > 0;
	}

	public BigDecimal computeConcentration(ArrayList<BigDecimal> c, ArrayList<BigDecimal> f) {
		BigDecimal cm = BigDecimal.valueOf(0d);
		for (int i = 0; i < c.size(); i++) {
			cm = cm.add(c.get(i).multiply(f.get(i)));
		}
		return cm;
	}

	public BigDecimal computeIsotope(ArrayList<BigDecimal> i, ArrayList<BigDecimal> c, ArrayList<BigDecimal> f) {
		BigDecimal im = BigDecimal.valueOf(0d);
		for (int j = 0; j < c.size(); j++) {
			BigDecimal m = c.get(j).multiply(f.get(j));
			im = im.add(i.get(j).multiply(m));
		}
		BigDecimal cm = computeConcentration(c, f);
		im = im.divide(cm, MathContext.DECIMAL64);
		return im;
	}

	public void fnr(int size, int position, BigDecimal positionValue, ArrayList<ArrayList<BigDecimal>> f) {
		if (position == size)
			return;
		BigDecimal sum = BigDecimal.valueOf(0d);
		ArrayList<BigDecimal> newRow = new ArrayList<BigDecimal>();
		for (int i = 0; i < position - 1; i++) {
			newRow.add(i, f.get(f.size() - 1).get(i));
		}

		newRow.add(position - 1, positionValue);

		for (int i = 0; i < position; i++) {
			sum = sum.add(newRow.get(i));
		}
		newRow.add(position, BigDecimal.valueOf(1d).subtract(sum));
		if (position < size - 1) {
			for (int i = position + 1; i < size; i++) {
				newRow.add(i, BigDecimal.valueOf(0d));
			}
		}
		f.add(newRow);
		BigDecimal index = newRow.get(position);
		while (index.compareTo(BigDecimal.valueOf(0d)) > 0) {
			fnr(size, position + 1, index, f);
			index = index.subtract(BigDecimal.valueOf(step));
		}

	}

	public ArrayList<ArrayList<BigDecimal>> fn3() {
		ArrayList<ArrayList<BigDecimal>> f = new ArrayList<ArrayList<BigDecimal>>();
		BigDecimal zero = BigDecimal.valueOf(0d);
		BigDecimal uno = BigDecimal.valueOf(1d);
		BigDecimal bStep = BigDecimal.valueOf(step);
		ArrayList<BigDecimal> row = new ArrayList<BigDecimal>();
		for (int i = 0; i < 2; i++) {
			row.add(i, zero);
		}
		row.add(2, uno);
		f.add(row);
		BigDecimal previous = zero;
		BigDecimal increment = bStep;
		while(previous.compareTo(uno) < 0) {
			row = new ArrayList<BigDecimal>();
			row.add(0, zero);
			previous = previous.add(increment);
			row.add(1, previous);
			row.add(2, uno.subtract(previous));
			f.add(row);
		}
		int size = f.size();
		for (int i = 0; i < size; i++ ) {
			row = new ArrayList<BigDecimal>();
			row.add(0, f.get(i).get(1));
			row.add(1, f.get(i).get(0));
			row.add(2, f.get(i).get(2));
			f.add(row);
		}
		for (int i = 0; i < size; i++ ) {
			row = new ArrayList<BigDecimal>();
			row.add(0, f.get(i).get(2));
			row.add(1, f.get(i).get(1));
			row.add(2, f.get(i).get(0));
			f.add(row);
		}
		for (int i = 0; i < size; i++ ) {
			row = new ArrayList<BigDecimal>();
			row.add(0, f.get(i).get(0));
			row.add(1, f.get(i).get(2));
			row.add(2, f.get(i).get(1));
			f.add(row);
		}

		f = deleteDuplicates(f);
		return f;
	}
	

	public ArrayList<ArrayList<BigDecimal>> fn2(int size) {
		ArrayList<ArrayList<BigDecimal>> f = new ArrayList<ArrayList<BigDecimal>>();
		ArrayList<BigDecimal> first = new ArrayList<BigDecimal>();
		first.add(0, BigDecimal.valueOf(0d));
		first.add(1, BigDecimal.valueOf(1d));
		for (int i = 2; i < size; i++) {
			first.add(i, BigDecimal.valueOf(0d));
		}
		f.add(first);
		BigDecimal index = BigDecimal.valueOf(0d);
//		long start = System.currentTimeMillis();
		while (index.compareTo(BigDecimal.valueOf(1d)) <= 0) {
			fnr(size, 1, index, f);
			index = index.add(BigDecimal.valueOf(step));
		}
		if (size == 3) {
			ArrayList<ArrayList<BigDecimal>> f3 = fn3();
			for (int i = 0; i < f3.size(); i++) 
				f.add(f3.get(i));
		}
		f = deleteDuplicates(f);
//		Collections.sort(f, new Comparator<ArrayList<ArrayList<BigDecimal>>>() {
//		    @Override
//		    public int compare(ArrayList<BigDecimal> item1, ArrayList<BigDecimal> item2) {
//		    	int check1 = item1.get(0).compareTo(item2.get(0));
//		    	if (check1 != 0)
//		    		return check1;
//		        return -item1.get(2).compareTo(item2.get(2));
//		    }
//		});
		return sort(f);
	}
	
	public ArrayList<ArrayList<BigDecimal>> sort(ArrayList<ArrayList<BigDecimal>> f) {
		ArrayList<ArrayList<BigDecimal>> sorted = new ArrayList<ArrayList<BigDecimal>>();
		while(min(f, sorted) == true); 
		return sorted;
	}
	
	private boolean min(ArrayList<ArrayList<BigDecimal>> source, ArrayList<ArrayList<BigDecimal>> target) {
		if (source.size() == 0)
			return false;
		ArrayList<BigDecimal> min = source.get(0);
		for (int i = 1; i < source.size(); i++) {
			if (compare(min, source.get(i)) < 0) {
				min = source.get(i);
			}
		}
		target.add(min);
		source.remove(min);
		return true;
	}
	
	private int compare(ArrayList<BigDecimal> a, ArrayList<BigDecimal> b) {
    	int check1 = a.get(0).compareTo(b.get(0));
    	return check1;
//    	if (check1 != 0)
//    		return check1;
//    	int check2 = a.get(1).compareTo(b.get(1));
//    	if (check2 != 0)
//    		return -check2;
//        return -a.get(2).compareTo(b.get(2));
	}
	
	public ArrayList<ArrayList<BigDecimal>> FN(int size) {
		ArrayList<ArrayList<BigDecimal>> f = fn2(size);
		ArrayList<BigDecimal> last =  new ArrayList<BigDecimal>();
		for (int i = 0; i < size - 1; i++) {
			last.add(BigDecimal.valueOf(0d));
		}
		last.add(BigDecimal.valueOf(1d));
		f.add(last);
		return f;
	}

	private ArrayList<ArrayList<BigDecimal>> shuffle(ArrayList<ArrayList<BigDecimal>> f, int pos1, int pos2, int size) {
		ArrayList<ArrayList<BigDecimal>> f1 = new ArrayList<ArrayList<BigDecimal>>(); // (ArrayList<ArrayList<BigDecimal>>)f.clone();
		int len = f.size();
		for (int i = 0; i < len; i++) {
			ArrayList<BigDecimal> row = (ArrayList<BigDecimal>) f.get(i).clone();
			BigDecimal old = row.get(pos1);
			row.set(pos1, row.get(pos2));
			row.set(pos2, old);
			f1.add(row);
		}
		return f1;
	}

	private ArrayList<ArrayList<BigDecimal>> deleteDuplicates(ArrayList<ArrayList<BigDecimal>> f) {
		ArrayList<ArrayList<BigDecimal>> f1 = new ArrayList<ArrayList<BigDecimal>>();
		f1.add(f.get(0));
		for (int i = 1; i < f.size(); i++) {
			checkPresence(f, f1);
		}
		return f1;
	}

	private void checkPresence(ArrayList<ArrayList<BigDecimal>> f, ArrayList<ArrayList<BigDecimal>> f1) {
		int index = 1;
		boolean found = false;
		while (index < f.size()) {
			ArrayList<BigDecimal> row = f.get(index);
			for (int i = 0; i < f1.size(); i++) {
				ArrayList<BigDecimal> row1 = f1.get(i);
				found = true;
				for (int j = 0; j < row1.size(); j++) {
					if (row.get(j).doubleValue() != row1.get(j).doubleValue()) {
						found = false;
						break;
					}
				}
				if (found == true) {
					break;
				}
			}
			if (found == false) {
				f1.add(row);
			}
			index++;
		}
	}

	public void printF(ArrayList<ArrayList<BigDecimal>> result) {
		for (int i = 0; i < result.size(); i++) {
			for (int j = 0; j < result.get(i).size(); j++) {
				System.out.print(result.get(i).get(j) + "  ");
			}
			System.out.println();
		}
		System.out.println();
	}

	public Double distanza(Double x0, Double y0, Double x1, Double y1) {
		BigDecimal xx0 = BigDecimal.valueOf(x0);
		BigDecimal yy0 = BigDecimal.valueOf(y0);
		BigDecimal xx1 = BigDecimal.valueOf(x1);
		BigDecimal yy1 = BigDecimal.valueOf(y1);
		BigDecimal modulo1 = xx0.subtract(xx1);
		modulo1 = modulo1.multiply(modulo1);
		BigDecimal modulo2 = yy0.subtract(yy1);
		modulo2 = modulo2.multiply(modulo2);
		BigDecimal modulo = modulo1.add(modulo2);
		modulo = modulo.sqrt(MathContext.DECIMAL64);
		return modulo.doubleValue();
	}

	public static void main(String args[]) {
		Member[] members = { new Member("M01", "SIO2", 53.06d), new Member("M02", "SIO2", 55.98d), new Member("M03", "SIO2", 55.29d) };

		GeoData geoData = new GeoData(members);
		geoData.setStep(0.10d);
		
		GeoData[] gd = { geoData };
		
		Mixing mixing = new Mixing(gd);
		mixing.compute();
		for (GeoData data : gd) {
			mixing.setStep(data.getStep());
		}
//		ArrayList<ArrayList<BigDecimal>> result = mixing.fn2(3);
//		ArrayList<ArrayList<BigDecimal>> result = mixing.fn3();
//		mixing.printF(result);
//		System.out.println();
//		result = mixing.fn2(3);
//		mixing.printF(result);
//		for (int i = 0; i < result.size(); i++) {
//			for (int j = 0; j < result.get(i).size(); j++) {
//				System.out.print(result.get(i).get(j) + "  ");
//			}
//			System.out.println();
//		}
//		ArrayList<BigDecimal> i = new ArrayList<BigDecimal>();
//		ArrayList<BigDecimal> c = new ArrayList<BigDecimal>();
//		ArrayList<BigDecimal> f = new ArrayList<BigDecimal>();
//		
//		i.add(BigDecimal.valueOf(0.265d));
//		i.add(BigDecimal.valueOf(0.392d));
//		
//		c.add(BigDecimal.valueOf(1.77d));
//		c.add(BigDecimal.valueOf(92d));
//		
//		f.add(BigDecimal.valueOf(0.2d));
//		f.add(BigDecimal.valueOf(0.8d));
//		
//		BigDecimal im = mixing.computeIsotope(i, c, f);

		System.out.println("end");
	}
	
	

}
