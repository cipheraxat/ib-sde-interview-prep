# Barclays Bullet 7 — Jenkins, Fat JAR, Veracode

Packaged as executable fat JAR; Jenkins pipelines through test, staging, production; 25% faster release cycle; Veracode zero critical findings.

**30 seconds** We ship Spring Boot fat JARs via Jenkins with automated tests and Veracode scans. I automated promotions across environments and cut release cycle time about 25% while keeping zero critical security findings.

## Jenkins pipeline (typical)

pipeline {
  stages {
    stage('Checkout')      { git checkout scm }
    stage('Build')         { sh 'mvn -B clean package -DskipTests=false' }
    stage('Unit Tests')    { junit '\*\*/target/surefire-reports/\*.xml' }
    stage('Integration')   { sh 'mvn verify -Pintegration' }
    stage('Veracode')      { veracodeScan(...); failOnCritical() }
    stage('Publish')       { archiveArtifacts '\*\*/integration-app.jar' }
    stage('Deploy Test')   { deploy(env: 'test') }
    stage('Deploy Staging'){ input message: 'Promote?'; deploy('staging') }
    stage('Deploy Prod')   { input message: 'Prod?'; deploy('prod') }
  }
}
  

**Q:** What is a fat JAR?

Spring Boot repackages dependencies + embedded Tomcat into one executable JAR. Deploy: `java -jar integration-app.jar --spring.profiles.active=prod`. Alternative: thin JAR + lib folder — fat JAR simpler for ops on Linux VMs.

**Q:** How did you achieve 25% faster releases?

Pick 2–3 real changes: parallelized test and Veracode stages; cached Maven dependencies; removed manual artifact copy; standardized Helm/script deploy; fixed flaky tests that blocked pipeline; template pipeline shared across modules. Baseline: median commit-to-prod over 8 weeks before vs after.

**Q:** Veracode — categories you fixed

| Finding | Fix |
|----|----|
| SQL Injection (CWE-89) | Parameterized queries / JPA — never string concat SQL |
| Hardcoded credentials (CWE-798) | Vault / Spring Cloud Config |
| Insecure random | `SecureRandom` for tokens |
| XPath / XXE | Disable external entities in XML parser |
| Vulnerable dependency | Bump library in pom.xml; OWASP dependency check |

**Q:** Deploy rollback?

Keep previous JAR version; blue/green or quick redeploy; DB migrations backward-compatible; feature flags disable new code path; TWS jobs unaffected if service health check fails — previous instance stays up.
