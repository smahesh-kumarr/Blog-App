pipeline {
    agent any

    environment {
        SONAR_URL = "http://54.85.130.134:9000"
        DOCKER_REGISTRY = "index.docker.io"
        DOCKER_IMAGE_FRONTEND = "maheshkumars772/frontend:latest"
        DOCKER_IMAGE_BACKEND = "maheshkumars772/backend:latest"
        NODE_OPTIONS = "--openssl-legacy-provider"
    }

    stages {
        stage('System Cleanup') {
            steps {
                sh '''#!/bin/bash -e
                    docker system prune -af || true
                    npm cache clean --force
                    find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
                    df -h
                    du -sh *
                '''
            }
        }

        stage('Clean Workspace & Checkout') {
            steps {
                cleanWs()
                sh 'mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts'
                git branch: 'main', url: 'https://github.com/smahesh-kumarr/Blog-App.git'
            }
        }

        stage('Frontend Pipeline') {
            stages {
                stage('Frontend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps --save
                            npm install --legacy-peer-deps --force --loglevel=error
                        '''
                    }
                }

                stage('Frontend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            DISABLE_ESLINT_PLUGIN=true npm run build
                        '''
                    }
                }

                stage('Frontend SonarQube Code Analysis') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd client
                                npx sonar-scanner \
                                    -Dsonar.projectKey=frontend-project \
                                    -Dsonar.sources=src \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Frontend Docker Build & Push') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                                sh '''
                                    # Login to Docker registry
                                    echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                                    
                                    # Build and push
                                    docker build -t ${DOCKER_IMAGE_FRONTEND} ./client
                                    docker push ${DOCKER_IMAGE_FRONTEND}
                                    
                                    # Cleanup
                                    docker rmi ${DOCKER_IMAGE_FRONTEND}
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Backend Pipeline') {
            stages {
                stage('Backend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd api
                            npm install --force --loglevel=error
                        '''
                    }
                }

                stage('Backend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                    cd api
                    # Conditional build execution
                    if npm run | grep -q 'build'; then
                        npm run build
                    else
                        echo "Skipping build as no build script exists"
                    fi
                '''
                    }
                }

                stage('Backend SonarQube Code Analysis') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd api
                                npx sonar-scanner \
                                    -Dsonar.projectKey=backend-project \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Backend Docker Build & Push') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                                sh '''
                                    # Login to Docker registry
                                    echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                                    
                                    # Build and push
                                    docker build -t ${DOCKER_IMAGE_BACKEND} ./api
                                    docker push ${DOCKER_IMAGE_BACKEND}
                                    
                                    # Cleanup
                                    docker rmi ${DOCKER_IMAGE_BACKEND}
                                '''
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            sh '''
                docker container prune -f
                docker image prune -af
            '''
        }
        always {
            cleanWs()
            sh 'docker logout || true'
            sh 'success'
        }
    }
}