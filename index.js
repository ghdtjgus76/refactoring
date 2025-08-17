class PerformanceCalculator {
  constructor(performance, play) {
    this.performance = performance;
    this.play = play;
  }

  get amount() {
    throw new Error(`알 수 없는 장르: ${this.play.type}`);
  }

  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  get volumeCredits() {
    return (super.volumeCredits += Math.floor(this.performance.audience / 5));
  }
}

function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice));

  function createStatementData(invoice) {
    const result = {};
    result.customer = invoice.customer;
    result.performances = invoice.performances.map(enrichPerformance);
    result.totalAmount = totalAmount(result);
    result.totalVolumeCredits = totalVolumeCredits(result);

    return result;

    function createPerformanceCalculator(performance, play) {
      switch (play.type) {
        case "tragedy": {
          return new TragedyCalculator(performance, play);
        }
        case "comedy": {
          return new ComedyCalculator(performance, play);
        }
        default: {
          throw new Error(`알 수 없는 장르: ${play.type}`);
        }
      }
    }

    function enrichPerformance(performance) {
      const calculator = createPerformanceCalculator(
        performance,
        playFor(performance)
      );
      const result = Object.assign({}, performance);
      result.play = playFor(result);
      result.amount = calculator.amount;
      result.volumeCredits = calculator.volumeCredits;
      return result;
    }

    function playFor(performance) {
      return plays[performance.playId];
    }

    function volumeCreditsFor(performance) {
      let result = 0;
      const play = playFor(performance);
      result += Math.max(performance.audience - 30, 0);
      if (play.type === "comedy") {
        result += Math.floor(performance.audience / 5);
      }
      return result;
    }

    function totalVolumeCredits(data) {
      return data.performance.reduce((total, p) => total + p.volumeCredits, 0);
    }

    function totalAmount(data) {
      return data.performances.reduce((total, p) => total + p.amount, 0);
    }
  }

  function usd(number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(number / 100);
  }

  function renderPlainText(data) {
    let result = `청구 내역 (고객명: ${data.customer})\n`;

    for (let performance of data.performances) {
      result += ` ${performance.play.name}: ${usd(performance.amount)} (${
        performance.audience
      }석)\n`;
    }

    result += `총액 ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.volumeCredits}점\n`;
    return result;
  }
}
